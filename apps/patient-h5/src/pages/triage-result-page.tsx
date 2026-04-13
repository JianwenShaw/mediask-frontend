import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { TriageResult } from "@mediask/shared-types";

import { patientFlowPaths, usePatientFlowStore } from "../flow/patient-flow-store";
import { patientApi } from "../lib/api";

export const TriageResultPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const status = usePatientFlowStore((state) => state.status);
  const currentSessionId = usePatientFlowStore((state) => state.sessionId);
  const cachedResult = usePatientFlowStore((state) => state.triageResult);
  const startRegistrationFromTriage = usePatientFlowStore(
    (state) => state.startRegistrationFromTriage,
  );
  
  const [result, setResult] = useState<TriageResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      navigate(patientFlowPaths.home, { replace: true });
      return;
    }

    const fetchResult = async () => {
      try {
        setLoading(true);
        const { data } = await patientApi.getAiSessionTriageResult(sessionId);
        setResult(data);
      } catch (err) {
        // Fallback to cache if request fails but we have cached result
        if (cachedResult && currentSessionId === sessionId) {
          setResult(cachedResult);
        } else {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [sessionId, cachedResult, currentSessionId, navigate]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50 items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00b96b] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">正在获取导诊结果...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50 items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">获取结果失败</h2>
        <p className="text-gray-500 mb-8">无法加载导诊结果，请检查网络或重新问诊</p>
        <button
          onClick={() => navigate(patientFlowPaths.home, { replace: true })}
          className="px-6 py-3 bg-[#00b96b] text-white rounded-xl font-medium active:scale-95 transition-transform"
        >
          返回首页
        </button>
      </div>
    );
  }

  const hasDepartments = result.recommendedDepartments && result.recommendedDepartments.length > 0;
  const hasAdvice = !!result.careAdvice;
  const hasCitations = result.citations && result.citations.length > 0;

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
          {hasDepartments ? (
            <div className="flex flex-wrap gap-2">
              {result.recommendedDepartments!.map((dept, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-lg text-sm"
                >
                  {dept.departmentName}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">暂无明确推荐科室</p>
          )}
        </div>

        {/* Care Advice Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#00b96b] rounded-full"></div>
            <h2 className="font-semibold text-gray-900">护理与就医建议</h2>
          </div>
          {hasAdvice ? (
            <p className="text-gray-600 text-sm leading-relaxed">{result.careAdvice}</p>
          ) : (
            <p className="text-gray-400 text-sm italic">暂无建议</p>
          )}
        </div>

        {/* Citations Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#00b96b] rounded-full"></div>
            <h2 className="font-semibold text-gray-900">参考依据</h2>
          </div>
          {hasCitations ? (
            <ul className="space-y-2">
              {result.citations!.map((cite, i) => (
                <li key={i} className="text-sm text-gray-500 flex gap-2">
                  <span className="text-gray-300">•</span>
                  <span>{cite.snippet}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm italic">暂无参考依据</p>
          )}
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
              startRegistrationFromTriage(
                sessionId!,
                hasDepartments ? result.recommendedDepartments!.map((d) => d.departmentName) : []
              );
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