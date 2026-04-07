import { ApiError, createApiClient } from "@mediask/api-client";

import { usePatientAuthStore } from "../auth/auth-store";

export const patientApi = createApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
  getToken() {
    return usePatientAuthStore.getState().accessToken;
  },
  onUnauthorized() {
    usePatientAuthStore.getState().clearSession();
  },
  onForbidden(error: ApiError) {
    const message = error.requestId
      ? `${error.message} (requestId: ${error.requestId})`
      : error.message;

    window.alert(message);
  },
});
