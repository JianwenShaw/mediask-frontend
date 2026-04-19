import type {
  AiChatRequest,
  AiChatResponse,
  AiSession,
  AiSessionDetail,
  Encounter,
  EncounterAiSummary,
  EncounterStatus,
  KnowledgeBase,
  KnowledgeBaseCreateRequest,
  KnowledgeBaseListQuery,
  KnowledgeBaseUpdateRequest,
  KnowledgeDocument,
  KnowledgeDocumentImportResponse,
  KnowledgeDocumentListQuery,
  LoginRequest,
  LoginResponse,
  PageData,
  Result,
  TriageResult,
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

export const createApiClient = (options: ApiClientOptions = {}) => {
  const { baseUrl = "", getToken, onUnauthorized, onForbidden } = options;

  const buildQueryString = (query?: Record<string, string | number | undefined>) => {
    if (!query) {
      return "";
    }

    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) {
        continue;
      }

      searchParams.set(key, String(value));
    }

    const queryString = searchParams.toString();

    return queryString ? `?${queryString}` : "";
  };

  async function request<T>(
    input: string,
    init?: RequestInit,
  ): Promise<Result<T>> {
    const headers = new Headers(init?.headers);
    const token = getToken?.();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
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
    patch<T>(input: string, body?: unknown, init?: RequestInit) {
      return request<T>(input, {
        ...init,
        method: "PATCH",
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    },
    delete<T>(input: string, init?: RequestInit) {
      return request<T>(input, { ...init, method: "DELETE" });
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
    sendAiChat(body: AiChatRequest, init?: RequestInit) {
      return request<AiChatResponse>("/api/v1/ai/chat", {
        ...init,
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    getAiSessions(init?: RequestInit) {
      return request<{ items: AiSession[] }>(`/api/v1/ai/sessions`, {
        ...init,
        method: "GET",
      });
    },
    getAiSessionDetail(sessionId: string, init?: RequestInit) {
      return request<AiSessionDetail>(`/api/v1/ai/sessions/${sessionId}`, {
        ...init,
        method: "GET",
      });
    },
    getAiSessionTriageResult(sessionId: string, init?: RequestInit) {
      return request<TriageResult>(`/api/v1/ai/sessions/${sessionId}/triage-result`, {
        ...init,
        method: "GET",
      });
    },
    getEncounters(query: { status?: EncounterStatus } = {}, init?: RequestInit) {
      return request<{ items: Encounter[] }>(`/api/v1/encounters${buildQueryString(query)}`, {
        ...init,
        method: "GET",
      });
    },
    getEncounter(encounterId: string, init?: RequestInit) {
      return request<Encounter & { patientSummary?: Record<string, unknown> }>(
        `/api/v1/encounters/${encounterId}`,
        {
          ...init,
          method: "GET",
        },
      );
    },
    getEncounterAiSummary(encounterId: string, init?: RequestInit) {
      return request<EncounterAiSummary>(`/api/v1/encounters/${encounterId}/ai-summary`, {
        ...init,
        method: "GET",
      });
    },
    listKnowledgeBases(query: KnowledgeBaseListQuery = {}, init?: RequestInit) {
      return request<PageData<KnowledgeBase>>(
        `/api/v1/admin/knowledge-bases${buildQueryString(query)}`,
        {
          ...init,
          method: "GET",
        },
      );
    },
    createKnowledgeBase(body: KnowledgeBaseCreateRequest, init?: RequestInit) {
      return request<KnowledgeBase>("/api/v1/admin/knowledge-bases", {
        ...init,
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    updateKnowledgeBase(id: string, body: KnowledgeBaseUpdateRequest, init?: RequestInit) {
      return request<KnowledgeBase>(`/api/v1/admin/knowledge-bases/${id}`, {
        ...init,
        method: "PATCH",
        body: JSON.stringify(body),
      });
    },
    deleteKnowledgeBase(id: string, init?: RequestInit) {
      return request<void>(`/api/v1/admin/knowledge-bases/${id}`, {
        ...init,
        method: "DELETE",
      });
    },
    listKnowledgeDocuments(query: KnowledgeDocumentListQuery, init?: RequestInit) {
      return request<PageData<KnowledgeDocument>>(
        `/api/v1/admin/knowledge-documents${buildQueryString(query)}`,
        {
          ...init,
          method: "GET",
        },
      );
    },
    importKnowledgeDocument(formData: FormData, init?: RequestInit) {
      return request<KnowledgeDocumentImportResponse>("/api/v1/admin/knowledge-documents/import", {
        ...init,
        method: "POST",
        body: formData,
      });
    },
    deleteKnowledgeDocument(id: string, init?: RequestInit) {
      return request<void>(`/api/v1/admin/knowledge-documents/${id}`, {
        ...init,
        method: "DELETE",
      });
    },
    request,
  };
};
