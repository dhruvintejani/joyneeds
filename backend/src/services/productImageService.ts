import type { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../config/cloudinary.js";
import { cloudinaryConfigured, env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { MAX_PRODUCT_IMAGES } from "../middleware/productImageUpload.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

const imageSelect = {
  id: true,
  productId: true,
  publicId: true,
  sourceUrl: true,
  secureUrl: true,
  altText: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} as const;

function requireCloudinary() {
  if (!cloudinaryConfigured) {
    throw new AppError(
      503,
      "CLOUDINARY_NOT_CONFIGURED",
      "Product image uploads are not configured yet.",
    );
  }
}

function isSupportedImageBuffer(buffer: Buffer) {
  if (buffer.length < 12) return false;

  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;
  const isWebp =
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP";
  const isAvif =
    buffer.subarray(4, 8).toString("ascii") === "ftyp" &&
    ["avif", "avis"].includes(buffer.subarray(8, 12).toString("ascii"));

  return isJpeg || isPng || isWebp || isAvif;
}

function assertImageFile(file: Express.Multer.File) {
  if (!file.buffer?.length || !isSupportedImageBuffer(file.buffer)) {
    throw new AppError(
      400,
      "INVALID_IMAGE_CONTENT",
      "The uploaded file does not contain a supported JPG, PNG, WebP, or AVIF image.",
    );
  }
}

function uploadBuffer(file: Express.Multer.File, productId: string) {
  requireCloudinary();
  assertImageFile(file);

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: `${env.CLOUDINARY_FOLDER}/${productId}`,
        unique_filename: true,
        overwrite: false,
        use_filename: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary did not return an upload result."));
          return;
        }
        resolve(result);
      },
    );

    stream.end(file.buffer);
  });
}

async function destroyAsset(publicId: string) {
  requireCloudinary();
  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
}

async function destroyAssetQuietly(publicId: string, context: string) {
  try {
    await destroyAsset(publicId);
  } catch (error) {
    logger.warn("Cloudinary cleanup failed", {
      context,
      publicId,
      error: error instanceof Error ? error.message : "unknown",
    });
  }
}

export async function listProductImages(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found.");

  return prisma.productImage.findMany({
    where: { productId },
    select: imageSelect,
    orderBy: { sortOrder: "asc" },
  });
}

export async function addProductImages(productId: string, files: Express.Multer.File[]) {
  requireCloudinary();
  if (!files.length) {
    throw new AppError(400, "IMAGE_REQUIRED", "Choose at least one product image to upload.");
  }
  files.forEach(assertImageFile);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      images: { select: { sortOrder: true }, orderBy: { sortOrder: "desc" }, take: 1 },
      _count: { select: { images: true } },
    },
  });
  if (!product) throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  if (product._count.images + files.length > MAX_PRODUCT_IMAGES) {
    throw new AppError(
      400,
      "PRODUCT_IMAGE_LIMIT",
      `A product can have at most ${MAX_PRODUCT_IMAGES} images.`,
    );
  }

  const uploaded: UploadApiResponse[] = [];
  try {
    for (const file of files) uploaded.push(await uploadBuffer(file, productId));

    const startSortOrder = (product.images[0]?.sortOrder ?? -1) + 1;
    await prisma.$transaction(
      uploaded.map((asset, index) =>
        prisma.productImage.create({
          data: {
            productId,
            publicId: asset.public_id,
            secureUrl: asset.secure_url,
            sourceUrl: null,
            altText: product.name,
            sortOrder: startSortOrder + index,
          },
        }),
      ),
    );
  } catch (error) {
    await Promise.all(
      uploaded.map((asset) => destroyAssetQuietly(asset.public_id, "failed product image database write")),
    );
    throw error;
  }

  return listProductImages(productId);
}

export async function replaceProductImage(
  productId: string,
  imageId: string,
  file: Express.Multer.File | undefined,
) {
  requireCloudinary();
  if (!file) throw new AppError(400, "IMAGE_REQUIRED", "Choose an image to replace this product image.");
  assertImageFile(file);

  const existing = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
    select: imageSelect,
  });
  if (!existing) throw new AppError(404, "PRODUCT_IMAGE_NOT_FOUND", "Product image not found.");

  const uploaded = await uploadBuffer(file, productId);
  try {
    await prisma.productImage.update({
      where: { id: imageId },
      data: {
        publicId: uploaded.public_id,
        secureUrl: uploaded.secure_url,
        sourceUrl: null,
      },
    });
  } catch (error) {
    await destroyAssetQuietly(uploaded.public_id, "failed replacement database write");
    throw error;
  }

  if (existing.publicId) {
    await destroyAssetQuietly(existing.publicId, "replaced product image");
  }
  return listProductImages(productId);
}

export async function deleteProductImage(productId: string, imageId: string) {
  const existing = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
    select: imageSelect,
  });
  if (!existing) throw new AppError(404, "PRODUCT_IMAGE_NOT_FOUND", "Product image not found.");

  await prisma.productImage.delete({ where: { id: imageId } });

  if (existing.publicId) {
    if (!cloudinaryConfigured) {
      logger.warn("Cloudinary product image removed from database but remote cleanup is unavailable", {
        productId,
        imageId,
        publicId: existing.publicId,
      });
    } else {
      await destroyAssetQuietly(existing.publicId, "deleted product image");
    }
  }

  return listProductImages(productId);
}
