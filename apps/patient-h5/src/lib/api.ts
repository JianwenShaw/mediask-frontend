import { ApiError, createApiClient } from "@mediask/api-client";

import { usePatientAuthStore } from "../auth/auth-store";

const getToken = () => usePatientAuthStore.getState().accessToken;

const onUnauthorized = () => {
  usePatientAuthStore.getState().clearSession();
};

const onForbidden = (error: ApiError) => {
  const message = error.requestId
    ? `${error.message} (requestId: ${error.requestId})`
    : error.message;

  window.alert(message);
};

export const patientApi = createApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
  getToken,
  onUnauthorized,
  onForbidden,
});
