export type Result<T> = {
  code: number | string;
  msg: string;
  data: T;
  requestId: string;
  timestamp: string;
};

export type ApiResult<T> = Result<T>;

export type PageData<T> = {
  items: T[];
  pageNum: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
};

export type AuthRole = "PATIENT" | "DOCTOR" | "ADMIN";

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

export type UserContext = {
  userId: number;
  username: string;
  displayName: string;
  roles: string[];
};

export type AuthUser = UserContext;

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  userContext: UserContext;
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

export type AiSessionTurn = {
  turnId: number;
  role: string;
  content: string;
  createdAt: string;
};

export type AiSessionDetail = {
  sessionId: number;
  sceneType: "PRE_CONSULTATION";
  turns: AiSessionTurn[];
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

export type ClinicSession = {
  clinicSessionId: number;
  departmentId: number;
  departmentName: string;
  doctorId?: number;
  doctorName?: string;
  sessionDate: string; // yyyy-MM-dd
  periodCode: string; // MORNING, AFTERNOON, etc.
  clinicType: string;
  remainingCount: number;
  fee: number;
};

export type RegistrationStatus = "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export type Registration = {
  registrationId: number;
  orderNo: string;
  status: RegistrationStatus;
  createdAt: string;
  sourceAiSessionId?: number;
};

export type EncounterStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type Encounter = {
  encounterId: number;
  registrationId: number;
  patientUserId: number;
  patientName: string;
  departmentId: number;
  departmentName: string;
  sessionDate: string;
  periodCode: string;
  encounterStatus: EncounterStatus;
  startedAt?: string;
  endedAt?: string;
};

export type KnowledgeBaseOwnerType = "SYSTEM" | "DEPARTMENT" | "TOPIC";

export type KnowledgeBaseStatus = "ENABLED" | "DISABLED";

export type KnowledgeBase = {
  id: number;
  kbCode: string;
  name: string;
  ownerType: KnowledgeBaseOwnerType;
  ownerDeptId?: number;
  visibility: string;
  status: KnowledgeBaseStatus;
  docCount: number;
};

export type KnowledgeBaseListQuery = {
  keyword?: string;
  pageNum?: number;
  pageSize?: number;
};

export type KnowledgeBaseCreateRequest = {
  name: string;
  kbCode: string;
  ownerType: KnowledgeBaseOwnerType;
  ownerDeptId?: number;
  visibility: string;
};

export type KnowledgeBaseUpdateRequest = {
  name?: string;
  ownerType?: KnowledgeBaseOwnerType;
  ownerDeptId?: number;
  visibility?: string;
  status?: KnowledgeBaseStatus;
};

export type KnowledgeDocument = {
  id: number;
  documentUuid: string;
  title: string;
  sourceType: string;
  documentStatus: string;
  chunkCount: number;
};

export type KnowledgeDocumentListQuery = {
  knowledgeBaseId: number;
  pageNum?: number;
  pageSize?: number;
};

export type KnowledgeDocumentImportResponse = {
  documentId: number;
  documentUuid: string;
  chunkCount: number;
  documentStatus: string;
};
