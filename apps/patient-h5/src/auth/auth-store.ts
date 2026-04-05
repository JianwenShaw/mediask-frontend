import type { LoginResponse, UserContext } from "@mediask/shared-types";
import { create } from "zustand";

const STORAGE_KEY = "patient_auth";

export type PatientAuthStatus =
  | "anonymous"
  | "bootstrapping"
  | "authenticated"
  | "bootstrap_error"
  | "forbidden";

type StoredAuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserContext | null;
};

type PatientAuthStore = StoredAuthState & {
  status: PatientAuthStatus;
  bootstrapError: string | null;
  completeLogin: (session: LoginResponse) => void;
  setBootstrapping: () => void;
  syncCurrentUser: (user: UserContext) => void;
  setBootstrapError: (message: string) => void;
  clearSession: () => void;
};

const defaultStoredAuthState: StoredAuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
};

const hasPatientRole = (user: UserContext | null) =>
  Boolean(user?.roles.includes("PATIENT"));

const readStoredAuthState = (): StoredAuthState => {
  const rawValue = localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return defaultStoredAuthState;
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
    return defaultStoredAuthState;
  }
};

const writeStoredAuthState = (state: StoredAuthState) => {
  if (!state.accessToken) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const initialStoredAuthState = readStoredAuthState();

export const usePatientAuthStore = create<PatientAuthStore>((set, get) => ({
  ...initialStoredAuthState,
  status: initialStoredAuthState.accessToken ? "bootstrapping" : "anonymous",
  bootstrapError: null,
  completeLogin(session) {
    const nextState: StoredAuthState = {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.userContext,
    };

    writeStoredAuthState(nextState);
    set({
      ...nextState,
      status: hasPatientRole(session.userContext) ? "authenticated" : "forbidden",
      bootstrapError: null,
    });
  },
  setBootstrapping() {
    const { accessToken } = get();

    set({
      status: accessToken ? "bootstrapping" : "anonymous",
      bootstrapError: null,
    });
  },
  syncCurrentUser(user) {
    const { accessToken, refreshToken } = get();
    const nextState: StoredAuthState = {
      accessToken,
      refreshToken,
      user,
    };

    writeStoredAuthState(nextState);
    set({
      user,
      status: hasPatientRole(user) ? "authenticated" : "forbidden",
      bootstrapError: null,
    });
  },
  setBootstrapError(message) {
    set({
      status: "bootstrap_error",
      bootstrapError: message,
    });
  },
  clearSession() {
    writeStoredAuthState(defaultStoredAuthState);
    set({
      ...defaultStoredAuthState,
      status: "anonymous",
      bootstrapError: null,
    });
  },
}));
