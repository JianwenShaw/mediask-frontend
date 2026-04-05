import { ApiError, createApiClient } from "@mediask/api-client";

import { usePatientAuthStore } from "../auth/auth-store";

const buildLoginUrl = () => new URL("/login", window.location.origin).toString();

export const patientApi = createApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
  getToken() {
    return usePatientAuthStore.getState().accessToken;
  },
  onUnauthorized() {
    usePatientAuthStore.getState().clearSession();

    if (window.location.pathname !== "/login") {
      window.location.replace(buildLoginUrl());
    }
  },
  onForbidden(error: ApiError) {
    const message = error.requestId
      ? `${error.message} (requestId: ${error.requestId})`
      : error.message;

    window.alert(message);
  },
});
