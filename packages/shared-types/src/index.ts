export type ApiResult<T> = {
  code: number | string;
  msg: string;
  data: T;
  requestId: string;
  timestamp: string;
};

export type RiskLevel = "low" | "medium" | "high";

export type GuardrailAction = "allow" | "caution" | "refuse";

export type NextAction =
  | "VIEW_TRIAGE_RESULT"
  | "GO_REGISTRATION"
  | "EMERGENCY_OFFLINE"
  | "MANUAL_SUPPORT";

export type Citation = {
  chunkId: number;
  retrievalRank: number;
  fusionScore: number;
  snippet: string;
};

export type RecommendedDepartment = {
  departmentId: number;
  departmentName: string;
  priority: number;
  reason: string;
};

export type AuthUser = {
  userId: number;
  username: string;
  displayName: string;
  role: string;
};

export type AiChatRequest = {
  sessionId: number | null;
  message: string;
  departmentId: number | null;
  sceneType: "PRE_CONSULTATION";
  useStream: boolean;
};

export type TriageResult = {
  riskLevel: RiskLevel;
  guardrailAction: GuardrailAction;
  nextAction: NextAction;
  recommendedDepartments: RecommendedDepartment[];
  chiefComplaintSummary?: string;
  careAdvice?: string;
  citations: Citation[];
};

export type AiChatResponse = {
  sessionId: number;
  turnId: number;
  answer: string;
  triageResult: TriageResult;
};

export type AiChatStreamMeta = {
  sessionId: number;
  turnId: number;
  triageResult: TriageResult;
};

export type RegistrationHandoff = {
  sessionId: number;
  recommendedDepartmentId?: number;
  recommendedDepartmentName?: string;
  chiefComplaintSummary?: string;
  suggestedVisitType?: string;
  registrationQuery?: {
    departmentId?: number;
    dateFrom?: string;
  };
};

export type EncounterAiSummary = {
  encounterId: number;
  sessionId: number;
  chiefComplaintSummary: string;
  structuredSummary: string;
  riskLevel: RiskLevel;
  recommendedDepartments: RecommendedDepartment[];
  latestCitations: Citation[];
};

export type AuditEvent = {
  eventId: number;
  userId: number;
  action: string;
  resourceType: string;
  resourceId: string;
  createdAt: string;
};

export type DataAccessLog = {
  logId: number;
  userId: number;
  resourceType: string;
  resourceId: string;
  purpose: string;
  createdAt: string;
};
