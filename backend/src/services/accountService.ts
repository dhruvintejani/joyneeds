import { createClerkClient } from "@clerk/express";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

function getClerkClient() {
  if (!env.CLERK_SECRET_KEY) {
    throw new AppError(
      503,
      "CUSTOMER_AUTH_NOT_CONFIGURED",
      "Customer sign-in is not configured yet.",
    );
  }
  return createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
}

export async function syncCustomerAccount(clerkUserId: string) {
  const clerkUser = await getClerkClient().users.getUser(clerkUserId);
  const primaryEmail = clerkUser.emailAddresses.find(
    (item) => item.id === clerkUser.primaryEmailAddressId,
  )?.emailAddress;
  const primaryPhone = clerkUser.phoneNumbers.find(
    (item) => item.id === clerkUser.primaryPhoneNumberId,
  )?.phoneNumber;

  const user = await prisma.user.upsert({
    where: { clerkUserId },
    update: {
      email: primaryEmail ?? null,
      firstName: clerkUser.firstName ?? null,
      lastName: clerkUser.lastName ?? null,
      phone: primaryPhone ?? null,
    },
    create: {
      clerkUserId,
      email: primaryEmail ?? null,
      firstName: clerkUser.firstName ?? null,
      lastName: clerkUser.lastName ?? null,
      phone: primaryPhone ?? null,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}
