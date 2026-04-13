import { create } from "zustand";

import type { TriageResult } from "@mediask/shared-types";

const STORAGE_KEY = "patient_flow";

export type RegistrationEntrySource = "home" | "triage_result";

export type PatientFlowStatus =
  | "idle"
  | "consulting"
  | "triage_result_ready"
  | "triage_high_risk"
  | "registration_ready"
  | "registration_submitted";

type RegistrationEntry = {
  source: RegistrationEntrySource;
  sessionId: string | null;
  recommendedDepartments: string[];
};

type PatientFlowStore = {
  status: PatientFlowStatus;
  sessionId: string | null;
  triageResult: TriageResult | null;
  registrationEntry: RegistrationEntry | null;
  startConsultation: (sessionId: string) => void;
  completeTriage: (sessionId: string, triageResult: TriageResult) => void;
  startRegistrationFromHome: () => void;
  startRegistrationFromTriage: (sessionId: string, recommendedDepartments: string[]) => void;
  completeRegistration: () => void;
  resetFlow: () => void;
};

type StoredPatientFlowState = Pick<
  PatientFlowStore,
  "status" | "sessionId" | "triageResult" | "registrationEntry"
>;

const initialState: StoredPatientFlowState = {
  status: "idle" as const,
  sessionId: null,
  triageResult: null,
  registrationEntry: null,
};

const readStoredPatientFlowState = (): StoredPatientFlowState => {
  const rawValue = localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return initialState;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<StoredPatientFlowState>;

    return {
      status: parsed.status ?? initialState.status,
      sessionId: parsed.sessionId ?? null,
      triageResult: parsed.triageResult ?? null,
      registrationEntry: parsed.registrationEntry ?? null,
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return initialState;
  }
};

const writeStoredPatientFlowState = (state: StoredPatientFlowState) => {
  if (
    state.status === "idle" &&
    state.sessionId === null &&
    state.triageResult === null &&
    state.registrationEntry === null
  ) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const initialStoredPatientFlowState = readStoredPatientFlowState();

export const patientFlowPaths = {
  home: "/",
  login: "/login",
  registrations: "/registrations",
  registrationNew: "/registrations/new",
  aiSessions: "/ai/sessions",
  aiSession: (sessionId: string) => `/ai/session/${sessionId}`,
  triageResult: (sessionId: string) => `/triage/result/${sessionId}`,
  triageHighRisk: (sessionId: string) => `/triage/high-risk/${sessionId}`,
};

export const getTriageCompletionPath = (sessionId: string, triageResult: TriageResult) =>
  triageResult.nextAction === "EMERGENCY_OFFLINE"
    ? patientFlowPaths.triageHighRisk(sessionId)
    : patientFlowPaths.triageResult(sessionId);

export const usePatientFlowStore = create<PatientFlowStore>((set, get) => ({
  ...initialStoredPatientFlowState,
  startConsultation(sessionId) {
    const nextState: StoredPatientFlowState = {
      status: "consulting",
      sessionId,
      triageResult: null,
      registrationEntry: null,
    };

    writeStoredPatientFlowState(nextState);
    set(nextState);
  },
  completeTriage(sessionId, triageResult) {
    const nextState: StoredPatientFlowState = {
      status:
        triageResult.nextAction === "EMERGENCY_OFFLINE"
          ? "triage_high_risk"
          : "triage_result_ready",
      sessionId,
      triageResult,
      registrationEntry: null,
    };

    writeStoredPatientFlowState(nextState);
    set(nextState);
  },
  startRegistrationFromHome() {
    const nextState: StoredPatientFlowState = {
      status: "registration_ready",
      sessionId: null,
      triageResult: null,
      registrationEntry: {
        source: "home",
        sessionId: null,
        recommendedDepartments: [],
      },
    };

    writeStoredPatientFlowState(nextState);
    set(nextState);
  },
  startRegistrationFromTriage(sessionId, recommendedDepartments) {
    const nextState: StoredPatientFlowState = {
      status: "registration_ready",
      sessionId,
      triageResult: get().triageResult,
      registrationEntry: {
        source: "triage_result",
        sessionId,
        recommendedDepartments,
      },
    };

    writeStoredPatientFlowState(nextState);
    set(nextState);
  },
  completeRegistration() {
    const { registrationEntry, sessionId, triageResult } = get();
    const nextState: StoredPatientFlowState = {
      status: "registration_submitted",
      sessionId: registrationEntry?.sessionId ?? sessionId,
      triageResult,
      registrationEntry,
    };

    writeStoredPatientFlowState(nextState);
    set(nextState);
  },
  resetFlow() {
    writeStoredPatientFlowState(initialState);
    set(initialState);
  },
}));
