import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { AiSession } from "@mediask/shared-types";

import { patientFlowPaths } from "../flow/patient-flow-store";
import { patientApi } from "../lib/api";
import { formatApiDateTime } from "../lib/date-time";

export const AiSessionsPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<AiSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    patientApi
      .getAiSessions()
      .then((res) => {
        setSessions(res.data?.items ?? []);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] min-h-screen">
      {/* 顶部导航栏 */}
      <div className="px-5 pt-6 pb-4 flex items-center bg-white shadow-sm sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-600 active:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900 ml-2">问诊记录</h1>
      </div>

      {/* 列表区 */}
      <div className="p-5 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-10 text-gray-400">加载中...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <p className="text-gray-500 font-medium mb-1">暂无问诊记录</p>
            <p className="text-gray-400 text-sm">您的 AI 问诊记录将显示在这里</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.sessionId}
                onClick={() => navigate(patientFlowPaths.aiSession(session.sessionId))}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 line-clamp-2">
                      {session.chiefComplaintSummary || "智能预问诊"}
                    </h3>
                  </div>
                  <span
                    className={`ml-3 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                      session.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {session.status === "COMPLETED" ? "已完成" : "进行中"}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <svg className="w-4 h-4 mr-1.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {formatApiDateTime(session.startedAt).date} {formatApiDateTime(session.startedAt).time}
                  <div className="w-1 h-1 rounded-full bg-gray-300 mx-2"></div>
                  <span>{session.sceneType === "PRE_CONSULTATION" ? "导诊分诊" : "其他"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
