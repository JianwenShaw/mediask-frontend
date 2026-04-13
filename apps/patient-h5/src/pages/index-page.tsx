import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Registration } from "@mediask/shared-types";

import { usePatientAuthStore } from "../auth/auth-store";
import { patientFlowPaths, usePatientFlowStore } from "../flow/patient-flow-store";
import { patientApi } from "../lib/api";

const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return {
    date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
  };
};

export const IndexPage = () => {
  const navigate = useNavigate();
  const [upcomingReg, setUpcomingReg] = useState<Registration | null>(null);
  const user = usePatientAuthStore((state) => state.user);
  const logout = usePatientAuthStore((state) => state.clearSession);
  const startConsultation = usePatientFlowStore((state) => state.startConsultation);
  const startRegistrationFromHome = usePatientFlowStore((state) => state.startRegistrationFromHome);
  const displayName = user?.displayName || user?.username || "患者";
  const avatarText = displayName.slice(0, 1).toUpperCase();

  useEffect(() => {
    patientApi.get<{ items: Registration[] }>('/api/v1/registrations').then((res) => {
      const items = res.data?.items ?? [];
      const pending = items.find((item) => item.status === "PENDING_PAYMENT" || item.status === "CONFIRMED");
      if (pending) {
        setUpcomingReg(pending);
      }
    }).catch(err => console.error(err));
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] min-h-screen pb-safe">
      {/* 顶部个人信息区 */}
      <div className="px-6 pt-6 pb-4 flex justify-between items-center bg-white shadow-sm rounded-b-3xl mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm">
            {avatarText}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">上午好，{displayName}</h1>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              MediAsk 演示中心医院
            </p>
          </div>
        </div>
        <button 
          onClick={() => {
            if (window.confirm("确定要退出登录吗？")) {
              logout();
              navigate(patientFlowPaths.login, { replace: true });
            }
          }}
          className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 active:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </button>
      </div>

      <div className="px-5 space-y-5">
        {/* 核心功能：AI 问诊 Hero Card */}
        <div 
          onClick={() => {
            startConsultation("new");
            navigate(patientFlowPaths.aiSession("new"));
          }}
          className="bg-gradient-to-br from-[#00b96b] to-emerald-500 rounded-3xl p-6 text-white shadow-lg shadow-emerald-200 active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden"
        >
          {/* 装饰图形 */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute right-4 bottom-4 opacity-20">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
            </svg>
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-1">AI 智能问诊</h2>
            <p className="text-emerald-50 text-sm mb-5 opacity-90">症状描述 · 智能分诊 · 快速预约</p>
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
              立即咨询 
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* 快捷功能宫格 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="grid grid-cols-4 gap-4">
            <div
              onClick={() => {
                startRegistrationFromHome();
                navigate(patientFlowPaths.registrationNew);
              }}
              className="flex flex-col items-center gap-2 cursor-pointer active:opacity-70"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <span className="text-xs font-medium text-gray-700">预约挂号</span>
            </div>
            
            <div
              onClick={() => navigate(patientFlowPaths.registrations)}
              className="flex flex-col items-center gap-2 cursor-pointer active:opacity-70"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              </div>
              <span className="text-xs font-medium text-gray-700">我的挂号</span>
            </div>

            <div onClick={() => navigate(patientFlowPaths.aiSessions)} className="flex flex-col items-center gap-2 cursor-pointer active:opacity-70">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              </div>
              <span className="text-xs font-medium text-gray-700">问诊记录</span>
            </div>

            <div onClick={() => alert("处方功能暂未开放")} className="flex flex-col items-center gap-2 cursor-pointer active:opacity-70">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              </div>
              <span className="text-xs font-medium text-gray-700">电子处方</span>
            </div>
          </div>
        </div>

        {/* 近期行程 / 动态卡片 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-[#00b96b] rounded-full"></div>
            近期行程
          </h3>
          
          {upcomingReg ? (
            <div 
              onClick={() => navigate(patientFlowPaths.registrations)}
              className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between active:bg-emerald-50 transition-colors cursor-pointer"
            >
              <div>
                <div className="text-emerald-700 font-medium mb-1">
                  门诊预约: {upcomingReg.orderNo}
                </div>
                <div className="text-sm text-emerald-600/80">
                  {formatDateTime(upcomingReg.createdAt).date} {formatDateTime(upcomingReg.createdAt).time}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-emerald-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              暂无即将到来的就诊安排
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
