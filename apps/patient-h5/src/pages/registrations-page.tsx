import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { mockGetRegistrations } from "../services/mock/api";

export const RegistrationsPage = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING">("ALL");

  useEffect(() => {
    setLoading(true);
    mockGetRegistrations().then((data) => {
      setRegistrations(data);
      setLoading(false);
    });
  }, []);

  const filteredRegistrations = registrations.filter((reg) => {
    if (activeTab === "PENDING") return reg.status === "PENDING";
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen pb-safe">
      {/* Header */}
      <header className="px-4 py-3 bg-white shadow-sm flex items-center sticky top-0 z-10 pt-safe">
        <button
          onClick={() => navigate("/")}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700 active:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-semibold text-lg text-gray-900 ml-2">我的挂号</h1>
      </header>

      {/* Tabs */}
      <div className="bg-white px-4 pt-2 flex gap-6 border-b border-gray-100 sticky top-[calc(env(safe-area-inset-top)+52px)] z-10">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === "ALL" ? "text-[#00b96b]" : "text-gray-500"
          }`}
        >
          全部记录
          {activeTab === "ALL" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00b96b] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === "PENDING" ? "text-[#00b96b]" : "text-gray-500"
          }`}
        >
          待就诊
          {activeTab === "PENDING" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00b96b] rounded-t-full" />
          )}
        </button>
      </div>

      {/* List */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {loading ? (
          // Skeleton Loading
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
              <div className="flex justify-between items-center mb-4">
                <div className="h-5 w-24 bg-gray-200 rounded"></div>
                <div className="h-5 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))
        ) : filteredRegistrations.length > 0 ? (
          filteredRegistrations.map((reg) => (
            <div key={reg.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3">
                <div className="text-gray-500 text-sm font-medium">{reg.date} {reg.time}</div>
                <div
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    reg.status === "PENDING"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {reg.status === "PENDING" ? "待就诊" : "已完成"}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{reg.departmentName}</h3>
                <p className="text-sm text-gray-500">
                  就诊人：张三 <span className="mx-2 text-gray-300">|</span> 普通门诊
                </p>
              </div>

              {reg.status === "PENDING" && (
                <div className="flex gap-3 mt-2 pt-3 border-t border-gray-50">
                  <button className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium active:bg-gray-50 transition-colors">
                    取消预约
                  </button>
                  <button className="flex-1 py-2.5 bg-[#00b96b] text-white rounded-xl text-sm font-medium active:bg-[#009e5b] transition-colors">
                    查看详情
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          // Empty State
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm">暂无相关挂号记录</p>
          </div>
        )}
      </div>
    </div>
  );
};
