import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { patientFlowPaths, usePatientFlowStore } from "../flow/patient-flow-store";

export const TriageResultPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const status = usePatientFlowStore((state) => state.status);
  const currentSessionId = usePatientFlowStore((state) => state.sessionId);
  const result = usePatientFlowStore((state) => state.triageResult);
  const startRegistrationFromTriage = usePatientFlowStore(
    (state) => state.startRegistrationFromTriage,
  );
  const isValidResult =
    currentSessionId === sessionId && !!result && status !== "triage_high_risk";

  useEffect(() => {
    if (!isValidResult) {
      navigate(patientFlowPaths.home, { replace: true });
    }
  }, [isValidResult, navigate]);

  if (!isValidResult || !result) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50 pb-[100px]">
      <div className="bg-[#00b96b] text-white pt-12 pb-16 px-6 rounded-b-[40px] shadow-sm">
        <h1 className="text-2xl font-bold mb-2">导诊结果</h1>
        <p className="opacity-90 text-sm">AI 基于您的症状描述给出的就诊建议</p>
      </div>

      <div className="px-4 -mt-10 space-y-4">
        {/* Recommended Departments Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[#00b96b] rounded-full"></div>
            <h2 className="font-semibold text-gray-900">推荐就诊科室</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.recommendedDepartments.map((dept, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-lg text-sm"
              >
                {dept}
              </span>
            ))}
          </div>
        </div>

        {/* Care Advice Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#00b96b] rounded-full"></div>
            <h2 className="font-semibold text-gray-900">护理与就医建议</h2>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{result.careAdvice}</p>
        </div>

        {/* Citations Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#00b96b] rounded-full"></div>
            <h2 className="font-semibold text-gray-900">参考依据</h2>
          </div>
          <ul className="space-y-2">
            {result.citations.map((cite, i) => (
              <li key={i} className="text-sm text-gray-500 flex gap-2">
                <span className="text-gray-300">•</span>
                <span>{cite}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe z-50 shadow-[0_-8px_20px_rgba(0,0,0,0.03)] max-w-md mx-auto">
        <div className="flex gap-3">
          <button
            onClick={() => navigate(patientFlowPaths.aiSession(sessionId!))}
            className="flex-1 py-4 text-gray-600 bg-gray-100 rounded-xl font-medium active:bg-gray-200 transition-colors"
          >
            重新咨询
          </button>
          <button
            onClick={() => {
              startRegistrationFromTriage(sessionId!, result.recommendedDepartments);
              navigate(patientFlowPaths.registrationNew);
            }}
            className="flex-[2] py-4 bg-[#00b96b] text-white rounded-xl font-medium active:bg-[#009e5b] shadow-md shadow-emerald-500/20 transition-all"
          >
            去挂号预约
          </button>
        </div>
      </div>
    </div>
  );
};
