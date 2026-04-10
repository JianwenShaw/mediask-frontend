import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { ClinicSession } from "@mediask/shared-types";

import { patientFlowPaths, usePatientFlowStore } from "../flow/patient-flow-store";
import { patientApi } from "../lib/api";

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const dayNames = ["日", "一", "二", "三", "四", "五", "六"];

type Department = {
  id: string;
  name: string;
  available: boolean;
};

export const RegistrationsNewPage = () => {
  const navigate = useNavigate();
  const status = usePatientFlowStore((state) => state.status);
  const registrationEntry = usePatientFlowStore((state) => state.registrationEntry);
  const completeRegistration = usePatientFlowStore((state) => state.completeRegistration);

  const [clinicSessions, setClinicSessions] = useState<ClinicSession[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null); // MORNING | AFTERNOON
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmiting] = useState(false);
  
  const isValidEntry = status === "registration_ready" && !!registrationEntry;
  const recommendedDepartments = registrationEntry?.recommendedDepartments ?? [];
  const backPath =
    registrationEntry?.source === "triage_result" && registrationEntry.sessionId
      ? patientFlowPaths.triageResult(registrationEntry.sessionId)
      : patientFlowPaths.home;

  useEffect(() => {
    if (!isValidEntry || !registrationEntry) {
      navigate(patientFlowPaths.home, { replace: true });
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchSessions = async () => {
      try {
        const result = await patientApi.get<{ items: ClinicSession[] }>('/api/v1/clinic-sessions');
        if (cancelled) return;

        const sessions = result.data?.items ?? [];
        setClinicSessions(sessions);

        // Extract unique departments
        const deptMap = new Map<string, Department>();
        sessions.forEach(session => {
          if (!deptMap.has(String(session.departmentId))) {
            deptMap.set(String(session.departmentId), {
              id: String(session.departmentId),
              name: session.departmentName,
              available: true,
            });
          }
        });

        const depts = Array.from(deptMap.values());
        setDepartments(depts);

        // Find default dept
        const recommendedDept = depts.find((dept) =>
          recommendedDepartments.includes(dept.name),
        );
        
        if (recommendedDept) {
          setSelectedDeptId(recommendedDept.id);
        } else if (depts.length > 0) {
          setSelectedDeptId(depts[0].id);
        }
        
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setLoading(false);
        console.error("Failed to load clinic sessions", err);
      }
    };
    
    fetchSessions();

    return () => {
      cancelled = true;
    };
  }, [isValidEntry, navigate, recommendedDepartments, registrationEntry]);

  if (!isValidEntry || !registrationEntry) {
    return null;
  }

  // Derive available dates for selected dept
  const availableDatesForDept = Array.from(new Set(
    clinicSessions
      .filter(s => String(s.departmentId) === selectedDeptId)
      .map(s => s.sessionDate)
  )).sort();

  // If selectedDate is not in the list or not set, set it to the first available
  useEffect(() => {
    if (availableDatesForDept.length > 0 && (!selectedDate || !availableDatesForDept.includes(selectedDate))) {
      setSelectedDate(availableDatesForDept[0]);
    }
  }, [selectedDeptId, availableDatesForDept, selectedDate]);

  // Derive available times for selected dept & date
  const availableTimesForDate = clinicSessions
    .filter(s => String(s.departmentId) === selectedDeptId && s.sessionDate === selectedDate)
    .map(s => s.periodCode); // e.g. MORNING, AFTERNOON

  // If selectedTime is not available, reset it
  useEffect(() => {
    if (!selectedTime || !availableTimesForDate.includes(selectedTime)) {
      setSelectedTime(null);
    }
  }, [selectedDate, availableTimesForDate, selectedTime]);

  const dates = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = formatLocalDate(d);
    return {
      date: dateStr,
      displayDate: `${d.getMonth() + 1}-${d.getDate()}`,
      dayOfWeek: i === 0 ? "今天" : i === 1 ? "明天" : `周${dayNames[d.getDay()]}`,
      available: availableDatesForDept.includes(dateStr),
    };
  });

  const handleSubmit = async () => {
    if (!selectedDeptId || !selectedDate || !selectedTime) return;
    
    const session = clinicSessions.find(s => 
      String(s.departmentId) === selectedDeptId && 
      s.sessionDate === selectedDate && 
      s.periodCode === selectedTime
    );

    if (!session) {
      alert("所选排班已满或不存在");
      return;
    }

    setSubmiting(true);
    try {
      await patientApi.post('/api/v1/registrations', {
        clinicSessionId: session.clinicSessionId,
        clinicSlotId: 1, // mock slot
        sourceAiSessionId: registrationEntry?.sessionId === 'direct-registration' ? undefined : (typeof registrationEntry?.sessionId === 'string' ? parseInt(registrationEntry.sessionId, 10) : registrationEntry?.sessionId),
      });
      
      navigate(patientFlowPaths.registrations, { replace: true });
      completeRegistration();
    } catch (err) {
      console.error(err);
      alert("挂号失败，请重试");
    } finally {
      setSubmiting(false);
    }
  };

  const timeMap: Record<string, { label: string, time: string }> = {
    "MORNING": { label: "上午", time: "08:00 - 12:00" },
    "AFTERNOON": { label: "下午", time: "13:30 - 17:30" },
    "EVENING": { label: "晚上", time: "18:00 - 21:00" },
    "ALL_DAY": { label: "全天", time: "08:00 - 17:30" }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen pb-28">
      {/* Header */}
      <header className="px-4 py-3 bg-white shadow-sm flex items-center sticky top-0 z-10 pt-safe">
        <button
          onClick={() => navigate(backPath)}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700 active:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-semibold text-lg text-gray-900 ml-2">预约挂号</h1>
      </header>

      {loading ? (
        <div className="p-4 space-y-4 animate-pulse">
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-40 bg-gray-200 rounded-2xl"></div>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Department Selection */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-[#00b96b] rounded-full"></div>
              选择就诊科室
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors flex justify-between items-center ${
                    selectedDeptId === dept.id
                      ? "border-[#00b96b] bg-emerald-50 text-[#00b96b]"
                      : "border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  {dept.name}
                  {recommendedDepartments.includes(dept.name) && (
                    <span className="text-[10px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">AI 推荐</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-[#00b96b] rounded-full"></div>
              选择就诊时间
            </h2>
            
            {/* Horizontal Date Scroll */}
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
              {dates.map((d) => (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  disabled={!d.available}
                  className={`flex flex-col items-center justify-center min-w-[64px] py-2 rounded-xl border transition-colors shrink-0 ${
                    selectedDate === d.date
                      ? "border-[#00b96b] bg-[#00b96b] text-white shadow-sm shadow-emerald-500/20"
                      : d.available ? "border-gray-200 bg-white text-gray-500" : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <span className={`text-xs mb-1 ${selectedDate === d.date ? "text-emerald-100" : ""}`}>{d.dayOfWeek}</span>
                  <span className="text-sm font-bold">{d.displayDate}</span>
                </button>
              ))}
              {dates.length === 0 && (
                <div className="text-sm text-gray-400 py-4 text-center w-full">暂无排班日期</div>
              )}
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="mt-4 pt-4 border-t border-gray-50 space-y-3">
                {availableTimesForDate.map((timeCode) => {
                  const timeInfo = timeMap[timeCode] || { label: timeCode, time: "" };
                  const isSelected = selectedTime === timeCode;
                  return (
                    <button
                      key={timeCode}
                      onClick={() => setSelectedTime(timeCode)}
                      className={`w-full flex justify-between items-center py-4 px-5 rounded-xl border transition-colors ${
                        isSelected ? "border-[#00b96b] bg-emerald-50" : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <span className={`font-semibold ${isSelected ? "text-emerald-700" : "text-gray-700"}`}>{timeInfo.label}</span>
                        <span className="text-xs text-gray-400 mt-1">{timeInfo.time}</span>
                      </div>
                      {isSelected && (
                        <svg className="w-5 h-5 text-[#00b96b]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      )}
                    </button>
                  );
                })}
                {availableTimesForDate.length === 0 && (
                  <div className="text-sm text-gray-400 text-center py-4">无可选时段</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe z-50 shadow-[0_-8px_20px_rgba(0,0,0,0.03)] max-w-md mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">预估挂号费</span>
            <span className="text-lg font-bold text-orange-500">
              ¥ {
                clinicSessions.find(s => String(s.departmentId) === selectedDeptId && s.sessionDate === selectedDate && s.periodCode === selectedTime)?.fee 
                  ?? "0.00"
              }
            </span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!selectedDeptId || !selectedDate || !selectedTime || submitting}
            className="w-[200px] py-3.5 bg-[#00b96b] text-white rounded-xl font-medium active:bg-[#009e5b] disabled:opacity-50 disabled:active:bg-[#00b96b] transition-all flex items-center justify-center shadow-md shadow-emerald-500/20"
          >
            {submitting ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {submitting ? "提交中..." : "确认预约"}
          </button>
        </div>
      </div>
    </div>
  );
};
