import type { LoginResponse, UserContext } from "@mediask/shared-types";

const STORAGE_KEY = "backoffice_auth";
const AUTH_CHANGE_EVENT = "backoffice-auth-change";

export type StoredAuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserContext | null;
};

const defaultAuthState: StoredAuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
};

const emitAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const readStoredAuthState = (): StoredAuthState => {
  const rawValue = localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return defaultAuthState;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<StoredAuthState>;

    return {
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
      user: parsed.user ?? null,
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return defaultAuthState;
  }
};

export const writeStoredAuthState = (state: StoredAuthState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  emitAuthChange();
};

export const setStoredAuthSession = (session: LoginResponse | { accessToken: string; refreshToken: string | null; userContext: UserContext; }) => {
  writeStoredAuthState({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    user: session.userContext,
  });
};

export const updateStoredAuthUser = (user: UserContext) => {
  const currentState = readStoredAuthState();

  writeStoredAuthState({
    ...currentState,
    user,
  });
};

export const clearStoredAuthState = () => {
  localStorage.removeItem(STORAGE_KEY);
  emitAuthChange();
};

export const subscribeAuthChange = (onChange: () => void) => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      onChange();
    }
  };

  window.addEventListener(AUTH_CHANGE_EVENT, onChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", handleStorage);
  };
};
