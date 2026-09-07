import {
  ClerkProvider,
  useAuth,
  useClerk,
  useUser,
} from "@clerk/react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { apiBaseUrl } from "../api/catalog";

type CustomerUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  imageUrl: string | null;
};

type CustomerAuthValue = {
  enabled: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  user: CustomerUser | null;
  openSignIn: () => void;
  openSignUp: () => void;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
};

const publishableKey = (
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined
)?.trim();

const guestValue: CustomerAuthValue = {
  enabled: false,
  isLoaded: true,
  isSignedIn: false,
  user: null,
  openSignIn: () => undefined,
  openSignUp: () => undefined,
  signOut: async () => undefined,
  getToken: async () => null,
};

const CustomerAuthContext = createContext<CustomerAuthValue>(guestValue);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  if (!publishableKey) {
    return (
      <CustomerAuthContext.Provider value={guestValue}>
        {children}
      </CustomerAuthContext.Provider>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkBridge>{children}</ClerkBridge>
    </ClerkProvider>
  );
}

function ClerkBridge({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const syncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id || !apiBaseUrl) return;
    if (syncedUserId.current === user.id) return;

    let cancelled = false;
    void getToken()
      .then((token) => {
        if (!token || cancelled) return null;
        return fetch(`${apiBaseUrl}/api/account`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      })
      .then((response) => {
        if (response?.ok && !cancelled) syncedUserId.current = user.id;
      })
      .catch(() => {
        // Account sync can retry on a later mount; storefront access remains available.
      });

    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded, isSignedIn, user?.id]);

  const value = useMemo<CustomerAuthValue>(
    () => ({
      enabled: true,
      isLoaded,
      isSignedIn: Boolean(isSignedIn),
      user: user
        ? {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.primaryEmailAddress?.emailAddress ?? null,
            imageUrl: user.imageUrl || null,
          }
        : null,
      openSignIn: () => {
        void clerk.openSignIn({});
      },
      openSignUp: () => {
        void clerk.openSignUp({});
      },
      signOut: async () => {
        syncedUserId.current = null;
        await clerk.signOut();
      },
      getToken: async () => (await getToken()) ?? null,
    }),
    [clerk, getToken, isLoaded, isSignedIn, user],
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  return useContext(CustomerAuthContext);
}
