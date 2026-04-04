import type {
  AiChatRequest,
  AiChatStreamMeta,
  LoginRequest,
  LoginResponse,
  Result,
  UserContext,
} from "@mediask/shared-types";

export type ApiClientOptions = {
  baseUrl?: string;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
  onForbidden?: (error: ApiError) => void;
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

export type AiChatStreamMessageEvent = {
  event: "message";
  data: string;
};

export type AiChatStreamMetaEvent = {
  event: "meta";
  data: AiChatStreamMeta;
};

export type AiChatStreamEndEvent = {
  event: "end";
};

export type AiChatStreamErrorData = {
  code?: number | string;
  msg?: string;
  requestId?: string;
  timestamp?: string;
};

export type AiChatStreamErrorEvent = {
  event: "error";
  data: AiChatStreamErrorData;
};

export type AiChatStreamEvent =
  | AiChatStreamMessageEvent
  | AiChatStreamMetaEvent
  | AiChatStreamEndEvent
  | AiChatStreamErrorEvent;

export type ConnectAiChatStreamOptions = {
  baseUrl?: string;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
  onForbidden?: (error: ApiError) => void;
  signal?: AbortSignal;
  body: AiChatRequest;
  onEvent: (event: AiChatStreamEvent) => void;
};

export type AiChatStreamConnection = {
  close: () => void;
};

const parseSseBlocks = (buffer: string) => {
  const normalized = buffer.replaceAll("\r\n", "\n");
  const separator = "\n\n";
  const blocks: string[] = [];
  let startIndex = 0;

  while (true) {
    const separatorIndex = normalized.indexOf(separator, startIndex);

    if (separatorIndex === -1) {
      break;
    }

    blocks.push(normalized.slice(startIndex, separatorIndex));
    startIndex = separatorIndex + separator.length;
  }

  return {
    blocks,
    rest: normalized.slice(startIndex),
  };
};

const parseSseEvent = (block: string): AiChatStreamEvent | null => {
  const lines = block.split("\n");
  let eventName = "message";
  const dataLines: string[] = [];

  for (const line of lines) {
    if (!line || line.startsWith(":")) {
      continue;
    }

    if (line.startsWith("event:")) {
      eventName = line.slice("event:".length).trim();
      continue;
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trimStart());
    }
  }

  const data = dataLines.join("\n");

  if (eventName === "message") {
    return {
      event: "message",
      data,
    };
  }

  if (eventName === "meta") {
    return {
      event: "meta",
      data: JSON.parse(data) as AiChatStreamMeta,
    };
  }

  if (eventName === "end") {
    return {
      event: "end",
    };
  }

  if (eventName === "error") {
    return {
      event: "error",
      data: JSON.parse(data) as AiChatStreamErrorData,
    };
  }

  return null;
};

export const connectAiChatStream = async ({
  baseUrl = "",
  getToken,
  onUnauthorized,
  onForbidden,
  signal,
  body,
  onEvent,
}: ConnectAiChatStreamOptions): Promise<AiChatStreamConnection> => {
  const headers = new Headers({
    Accept: "text/event-stream",
    "Content-Type": "application/json",
  });
  const token = getToken?.();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const controller = new AbortController();
  const abortStream = () => {
    controller.abort();
  };

  signal?.addEventListener("abort", abortStream, { once: true });

  try {
    const response = await fetch(`${baseUrl}/api/v1/ai/chat/stream`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (response.status === 401) {
      onUnauthorized?.();
      const error = new ApiError("Unauthorized", response.status);
      throw error;
    }

    if (response.status === 403) {
      const error = new ApiError("Forbidden", response.status);
      onForbidden?.(error);
      throw error;
    }

    if (!response.ok) {
      throw new ApiError("Failed to open AI chat stream", response.status);
    }

    if (!response.body) {
      throw new Error("SSE response body is empty");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    void (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const parsed = parseSseBlocks(buffer);
          buffer = parsed.rest;

          for (const block of parsed.blocks) {
            const event = parseSseEvent(block);

            if (event) {
              onEvent(event);
            }
          }
        }

        const finalChunk = decoder.decode();

        if (finalChunk) {
          buffer += finalChunk;
        }

        const trailingEvent = buffer.trim() ? parseSseEvent(buffer.trim()) : null;

        if (trailingEvent) {
          onEvent(trailingEvent);
        }
      } catch (error) {
        const streamError =
          error instanceof Error
            ? {
                msg: error.message,
              }
            : {
                msg: "Failed to process AI chat stream",
              };

        onEvent({
          event: "error",
          data: streamError,
        });
      } finally {
        signal?.removeEventListener("abort", abortStream);
        reader.releaseLock();
      }
    })();

    return {
      close() {
        controller.abort();
        signal?.removeEventListener("abort", abortStream);
      },
    };
  } catch (error) {
    signal?.removeEventListener("abort", abortStream);

    if (error instanceof ApiError) {
      throw error;
    }

    throw error;
  }
};

export const createApiClient = (options: ApiClientOptions = {}) => {
  const { baseUrl = "", getToken, onUnauthorized, onForbidden } = options;

  async function request<T>(
    input: string,
    init?: RequestInit,
  ): Promise<Result<T>> {
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

    const result = (await response.json()) as Result<T>;

    if (response.status === 401) {
      onUnauthorized?.();
      throw new ApiError(result.msg, response.status, result.requestId);
    }

    if (response.status === 403) {
      const error = new ApiError(result.msg, response.status, result.requestId);
      onForbidden?.(error);
      throw error;
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
    login(body: LoginRequest, init?: RequestInit) {
      return request<LoginResponse>("/api/v1/auth/login", {
        ...init,
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    getCurrentUser(init?: RequestInit) {
      return request<UserContext>("/api/v1/auth/me", {
        ...init,
        method: "GET",
      });
    },
    request,
  };
};
