import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useParams } from "react-router";

import { patientFlowPaths, usePatientFlowStore } from "../flow/patient-flow-store";

export const TriageHighRiskPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const status = usePatientFlowStore((state) => state.status);
  const currentSessionId = usePatientFlowStore((state) => state.sessionId);
  const resetFlow = usePatientFlowStore((state) => state.resetFlow);

  useEffect(() => {
    if (status !== "triage_high_risk" || currentSessionId !== sessionId) {
      navigate(patientFlowPaths.home, { replace: true });
    }
  }, [currentSessionId, navigate, sessionId, status]);

  if (status !== "triage_high_risk" || currentSessionId !== sessionId) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fff5f5] px-4 pt-6 pb-28">
      <div className="flex flex-1 flex-col justify-center">
        <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v4m0 4h.01M10.29 3.86l-7.5 13A1 1 0 003.66 18h16.68a1 1 0 00.87-1.5l-7.5-13a1 1 0 00-1.74 0z"
              />
            </svg>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold tracking-[0.14em] text-red-500">高风险预警</p>
            <h1 className="text-2xl font-bold leading-tight text-gray-900">请立即停止线上流程，尽快前往急诊</h1>
            <p className="text-base leading-7 text-gray-700">
              您当前描述的症状提示可能存在严重急性风险。此时不建议继续普通问诊或挂号，请立即拨打 120，
              或尽快前往最近医院急诊就医。
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
            胸痛、晕厥等症状可能需要线下紧急处置。若出现持续加重、呼吸困难或意识异常，请优先呼叫急救。
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-md border-t border-red-100 bg-white p-4 pb-safe shadow-[0_-8px_20px_rgba(239,68,68,0.08)]">
        <div className="flex flex-col gap-3">
          <a
            href="tel:120"
            className="flex min-h-[48px] items-center justify-center rounded-xl bg-red-500 px-4 py-3 text-base font-semibold text-white active:bg-red-600"
          >
            立即拨打 120
          </a>
          <button
            type="button"
            onClick={() => {
              resetFlow();
              navigate(patientFlowPaths.home, { replace: true });
            }}
            className="min-h-[48px] rounded-xl bg-red-50 px-4 py-3 text-base font-medium text-red-600 active:bg-red-100"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
};
