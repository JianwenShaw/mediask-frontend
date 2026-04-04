import type { ApiResult } from "@mediask/shared-types";

export type ApiClientOptions = {
  baseUrl?: string;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
  onForbidden?: () => void;
};

export class ApiError extends Error {
  status: number;
  requestId?: string;

  constructor(message: string, status: number, requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.requestId = requestId;
  }
}

export const createApiClient = (options: ApiClientOptions = {}) => {
  const { baseUrl = "", getToken, onUnauthorized, onForbidden } = options;

  async function request<T>(
    input: string,
    init?: RequestInit,
  ): Promise<ApiResult<T>> {
    const headers = new Headers(init?.headers);
    const token = getToken?.();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (init?.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${baseUrl}${input}`, {
      ...init,
      headers,
    });

    const result = (await response.json()) as ApiResult<T>;

    if (response.status === 401) {
      onUnauthorized?.();
      throw new ApiError(result.msg, response.status, result.requestId);
    }

    if (response.status === 403) {
      onForbidden?.();
      throw new ApiError(result.msg, response.status, result.requestId);
    }

    if (!response.ok) {
      throw new ApiError(result.msg, response.status, result.requestId);
    }

    return result;
  }

  return {
    get<T>(input: string, init?: RequestInit) {
      return request<T>(input, { ...init, method: "GET" });
    },
    post<T>(input: string, body?: unknown, init?: RequestInit) {
      return request<T>(input, {
        ...init,
        method: "POST",
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    },
    request,
  };
};
