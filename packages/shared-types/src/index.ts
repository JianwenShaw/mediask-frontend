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
  chunkId: string;
  retrievalRank: number;
  fusionScore: number;
  snippet: string;
};

export type RecommendedDepartment = {
  departmentId: string;
  departmentName: string;
  priority: number;
  reason: string;
};

export type UserContext = {
  userId: string;
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
  sessionId: string | null;
  message: string;
  departmentId: string | null;
  sceneType: "PRE_CONSULTATION";
  useStream: boolean;
};

export type TriageResult = {
  riskLevel: RiskLevel;
  guardrailAction: GuardrailAction;
  nextAction: NextAction;
  recommendedDepartments?: RecommendedDepartment[];
  chiefComplaintSummary?: string;
  careAdvice?: string;
  citations?: Citation[];
};

export type AiChatResponse = {
  sessionId: string;
  turnId: string;
  answer: string;
  triageResult: TriageResult;
};

export type AiChatStreamMeta = {
  sessionId: string;
  turnId: string;
  triageResult: TriageResult;
};

export type AiMessage = {
  role: string;
  content: string;
  createdAt: string;
};

export type AiSessionTurn = {
  turnId: string;
  turnNo: number;
  turnStatus: string;
  startedAt: string;
  completedAt?: string;
  errorCode?: string;
  errorMessage?: string;
  messages: AiMessage[];
};

export type AiSession = {
  sessionId: string;
  sceneType: string;
  status: string;
  departmentId?: string;
  chiefComplaintSummary?: string;
  summary?: string;
  startedAt: string;
  endedAt?: string;
};

export type AiSessionDetail = AiSession & {
  turns: AiSessionTurn[];
};

export type RegistrationHandoff = {
  sessionId: string;
  recommendedDepartmentId?: string;
  recommendedDepartmentName?: string;
  chiefComplaintSummary?: string;
  suggestedVisitType?: string;
  registrationQuery?: {
    departmentId?: string;
    dateFrom?: string;
  };
};

export type EncounterAiSummary = {
  encounterId: string;
  sessionId: string;
  chiefComplaintSummary: string;
  structuredSummary: string;
  riskLevel: RiskLevel;
  recommendedDepartments: RecommendedDepartment[];
  latestCitations: Citation[];
};

export type AuditEvent = {
  eventId: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  createdAt: string;
};

export type DataAccessLog = {
  logId: string;
  userId: string;
  resourceType: string;
  resourceId: string;
  purpose: string;
  createdAt: string;
};

export type ClinicSession = {
  clinicSessionId: string;
  departmentId: string;
  departmentName: string;
  doctorId?: string;
  doctorName?: string;
  sessionDate: string; // yyyy-MM-dd
  periodCode: string; // MORNING, AFTERNOON, etc.
  clinicType: string;
  remainingCount: number;
  fee: number;
};

export type RegistrationStatus = "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export type Registration = {
  registrationId: string;
  orderNo: string;
  status: RegistrationStatus;
  createdAt: string;
  sourceAiSessionId?: string;
};

export type EncounterStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type Encounter = {
  encounterId: string;
  registrationId: string;
  patientUserId: string;
  patientName: string;
  departmentId: string;
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
  id: string;
  kbCode: string;
  name: string;
  ownerType: KnowledgeBaseOwnerType;
  ownerDeptId?: string;
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
  ownerDeptId?: string;
  visibility: string;
};

export type KnowledgeBaseUpdateRequest = {
  name?: string;
  ownerType?: KnowledgeBaseOwnerType;
  ownerDeptId?: string;
  visibility?: string;
  status?: KnowledgeBaseStatus;
};

export type KnowledgeDocument = {
  id: string;
  documentUuid: string;
  title: string;
  sourceType: string;
  documentStatus: string;
  chunkCount: number;
};

export type KnowledgeDocumentListQuery = {
  knowledgeBaseId: string;
  pageNum?: number;
  pageSize?: number;
};

export type KnowledgeDocumentImportResponse = {
  documentId: string;
  documentUuid: string;
  chunkCount: number;
  documentStatus: string;
};
