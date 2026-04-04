import { ApiError, createApiClient } from "@mediask/api-client";
import { message } from "antd";

import { clearStoredAuthState, readStoredAuthState } from "../auth/auth-store";

const buildLoginRedirectUrl = () => {
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const loginUrl = new URL("/login", window.location.origin);

  if (currentPath !== "/login") {
    loginUrl.searchParams.set("from", currentPath);
  }

  return loginUrl.toString();
};

export const backofficeApi = createApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
  getToken() {
    return readStoredAuthState().accessToken;
  },
  onUnauthorized() {
    clearStoredAuthState();

    if (window.location.pathname !== "/login") {
      window.location.replace(buildLoginRedirectUrl());
    }
  },
  onForbidden(error: ApiError) {
    const errorText = error.requestId
      ? `${error.message} (requestId: ${error.requestId})`
      : error.message;

    void message.error(errorText);
  },
});
