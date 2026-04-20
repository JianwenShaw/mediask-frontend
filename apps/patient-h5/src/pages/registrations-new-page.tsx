import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import type { ClinicSession, ClinicSlot } from "@mediask/shared-types";

import { patientFlowPaths, usePatientFlowStore } from "../flow/patient-flow-store";
import { patientApi } from "../lib/api";
import { formatApiDateTime } from "../lib/date-time";

type Department = {
  id: string;
  name: string;
};

type SessionWithDate = ClinicSession & {
  normalizedDate: string;
};

const dayNames = ["日", "一", "二", "三", "四", "五", "六"];

const periodRank: Record<string, number> = {
  MORNING: 1,
  AFTERNOON: 2,
  EVENING: 3,
  ALL_DAY: 4,
};

const periodMap: Record<string, string> = {
  MORNING: "上午",
  AFTERNOON: "下午",
  EVENING: "晚上",
  ALL_DAY: "全天",
};

const normalizeDate = (value: string) => {
  const trimmed = value.trim();
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!ymdMatch) {
    return "";
  }
  return `${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`;
};

export const RegistrationsNewPage = () => {
  const navigate = useNavigate();
  const status = usePatientFlowStore((state) => state.status);
  const registrationEntry = usePatientFlowStore((state) => state.registrationEntry);
  const completeRegistration = usePatientFlowStore((state) => state.completeRegistration);

  const [clinicSessions, setClinicSessions] = useState<ClinicSession[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [slots, setSlots] = useState<ClinicSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isValidEntry = status === "registration_ready" && !!registrationEntry;
  const recommendedDepartments = registrationEntry?.recommendedDepartments ?? [];
  const backPath =
    registrationEntry?.source === "triage_result" && registrationEntry.sessionId
      ? patientFlowPaths.triageResult(registrationEntry.sessionId)
      : patientFlowPaths.home;

  const sessionsWithDate: SessionWithDate[] = useMemo(
    () =>
      clinicSessions.map((session) => ({
        ...session,
        normalizedDate: normalizeDate(session.sessionDate),
      })),
    [clinicSessions],
  );

  const departments: Department[] = useMemo(() => {
    const map = new Map<string, Department>();
    sessionsWithDate.forEach((session) => {
      const id = String(session.departmentId);
      if (!map.has(id)) {
        map.set(id, { id, name: session.departmentName });
      }
    });
    return Array.from(map.values());
  }, [sessionsWithDate]);

  const availableDatesForDept = useMemo(
    () =>
      Array.from(
        new Set(
          sessionsWithDate
            .filter((session) => String(session.departmentId) === selectedDeptId)
            .map((session) => session.normalizedDate),
        ),
      )
        .filter(Boolean)
        .sort(),
    [selectedDeptId, sessionsWithDate],
  );

  const sessionsForDate = useMemo(
    () =>
      sessionsWithDate
        .filter(
          (session) =>
            String(session.departmentId) === selectedDeptId && session.normalizedDate === selectedDate,
        )
        .sort((a, b) => {
          const rankDiff = (periodRank[a.periodCode] ?? 99) - (periodRank[b.periodCode] ?? 99);
          if (rankDiff !== 0) {
            return rankDiff;
          }
          return a.clinicSessionId.localeCompare(b.clinicSessionId);
        }),
    [selectedDate, selectedDeptId, sessionsWithDate],
  );

  const selectedSession = useMemo(
    () => sessionsForDate.find((item) => item.clinicSessionId === selectedSessionId) ?? null,
    [selectedSessionId, sessionsForDate],
  );

  const displayDates = useMemo(
    () =>
      availableDatesForDept.map((dateStr) => {
        const date = new Date(`${dateStr}T00:00:00`);
        const valid = !Number.isNaN(date.getTime());
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const current = new Date(date);
        current.setHours(0, 0, 0, 0);
        const diffDays = Math.round((current.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
        return {
          date: dateStr,
          displayDate: valid ? `${date.getMonth() + 1}-${date.getDate()}` : dateStr,
          dayOfWeek: valid ? (diffDays === 0 ? "今天" : diffDays === 1 ? "明天" : `周${dayNames[date.getDay()]}`) : "可约",
        };
      }),
    [availableDatesForDept],
  );

  useEffect(() => {
    if (!isValidEntry || !registrationEntry) {
      navigate(patientFlowPaths.home, { replace: true });
      return;
    }

    let cancelled = false;
    setLoading(true);

    patientApi
      .get<{ items: ClinicSession[] }>("/api/v1/clinic-sessions")
      .then((result) => {
        if (cancelled) {
          return;
        }
        setClinicSessions(result.data?.items ?? []);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load clinic sessions", err);
          window.alert("门诊排班加载失败，请稍后重试");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isValidEntry, navigate, registrationEntry]);

  useEffect(() => {
    if (!departments.length) {
      if (selectedDeptId !== null) {
        setSelectedDeptId(null);
      }
      return;
    }

    const stillExists = selectedDeptId
      ? departments.some((dept) => dept.id === selectedDeptId)
      : false;

    if (stillExists) {
      return;
    }

    const recommended = departments.find((dept) => recommendedDepartments.includes(dept.name));
    const next = recommended?.id ?? departments[0].id;
    if (next !== selectedDeptId) {
      setSelectedDeptId(next);
    }
  }, [departments, recommendedDepartments, selectedDeptId]);

  useEffect(() => {
    if (!availableDatesForDept.length) {
      setSelectedDate(null);
      return;
    }
    if (!selectedDate || !availableDatesForDept.includes(selectedDate)) {
      setSelectedDate(availableDatesForDept[0]);
    }
  }, [availableDatesForDept, selectedDate]);

  useEffect(() => {
    if (!sessionsForDate.length) {
      setSelectedSessionId(null);
      return;
    }
    if (!selectedSessionId || !sessionsForDate.some((item) => item.clinicSessionId === selectedSessionId)) {
      const firstAvailable = sessionsForDate.find((item) => item.remainingCount > 0) ?? sessionsForDate[0];
      setSelectedSessionId(firstAvailable.clinicSessionId);
    }
  }, [selectedSessionId, sessionsForDate]);

  useEffect(() => {
    if (!selectedSessionId) {
      setSlots([]);
      setSelectedSlotId(null);
      return;
    }

    let cancelled = false;
    setSlotsLoading(true);
    setSlots([]);
    setSelectedSlotId(null);

    patientApi
      .getClinicSessionSlots(selectedSessionId)
      .then((result) => {
        if (cancelled) {
          return;
        }
        const nextSlots = result.data?.items ?? [];
        setSlots(nextSlots);
        setSelectedSlotId(nextSlots[0]?.clinicSlotId ?? null);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load clinic slots", err);
          window.alert("号源加载失败，请重试");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSlotsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSessionId]);

  const handleSubmit = async () => {
    if (!selectedSessionId || !selectedSlotId) {
      return;
    }

    setSubmitting(true);
    try {
      await patientApi.post("/api/v1/registrations", {
        clinicSessionId: selectedSessionId,
        clinicSlotId: selectedSlotId,
        sourceAiSessionId: registrationEntry?.sessionId ?? undefined,
      });

      completeRegistration();
      navigate(patientFlowPaths.registrations, { replace: true });
    } catch (err) {
      console.error(err);
      window.alert("挂号失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isValidEntry || !registrationEntry) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen pb-28">
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
          <div className="h-24 bg-gray-200 rounded-2xl" />
          <div className="h-28 bg-gray-200 rounded-2xl" />
          <div className="h-36 bg-gray-200 rounded-2xl" />
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-[#00b96b] rounded-full" />
              选择就诊科室
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`min-h-11 py-3 px-4 rounded-xl border text-sm font-medium transition-colors flex justify-between items-center ${
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

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-[#00b96b] rounded-full" />
              选择就诊日期
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
              {displayDates.map((item) => (
                <button
                  key={item.date}
                  onClick={() => setSelectedDate(item.date)}
                  className={`min-h-11 flex flex-col items-center justify-center min-w-[72px] py-2 rounded-xl border transition-colors shrink-0 ${
                    selectedDate === item.date
                      ? "border-[#00b96b] bg-[#00b96b] text-white"
                      : "border-gray-200 bg-white text-gray-500"
                  }`}
                >
                  <span className={`text-xs mb-1 ${selectedDate === item.date ? "text-emerald-100" : ""}`}>{item.dayOfWeek}</span>
                  <span className="text-sm font-bold">{item.displayDate}</span>
                </button>
              ))}
              {displayDates.length === 0 && <div className="text-sm text-gray-400 py-4 w-full text-center">暂无排班日期</div>}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-[#00b96b] rounded-full" />
              选择就诊时段
            </h2>
            <div className="space-y-3">
              {sessionsForDate.map((session) => {
                const selected = selectedSessionId === session.clinicSessionId;
                const noInventory = session.remainingCount <= 0;
                return (
                  <button
                    key={session.clinicSessionId}
                    onClick={() => setSelectedSessionId(session.clinicSessionId)}
                    disabled={noInventory}
                    className={`w-full min-h-11 text-left py-3 px-4 rounded-xl border transition-colors ${
                      selected
                        ? "border-[#00b96b] bg-emerald-50"
                        : noInventory
                          ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                          : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${selected ? "text-emerald-700" : "text-gray-800"}`}>
                        {periodMap[session.periodCode] ?? session.periodCode}
                      </span>
                      <span className={`text-xs ${noInventory ? "text-gray-300" : "text-gray-500"}`}>
                        剩余 {Math.max(0, session.remainingCount)}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">医生：{session.doctorName ?? "-"}</div>
                  </button>
                );
              })}
              {sessionsForDate.length === 0 && <div className="text-sm text-gray-400 text-center py-4">该日期暂无可预约场次</div>}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-[#00b96b] rounded-full" />
              选择具体号源
            </h2>
            {slotsLoading ? (
              <div className="grid grid-cols-3 gap-3 animate-pulse">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="h-11 bg-gray-100 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {slots.map((slot) => {
                  const time = formatApiDateTime(slot.slotStartTime).time;
                  const selected = selectedSlotId === slot.clinicSlotId;
                  return (
                    <button
                      key={slot.clinicSlotId}
                      onClick={() => setSelectedSlotId(slot.clinicSlotId)}
                      className={`min-h-11 py-2 rounded-xl border text-sm font-medium transition-colors ${
                        selected
                          ? "border-[#00b96b] bg-[#00b96b] text-white"
                          : "border-gray-200 bg-white text-gray-700"
                      }`}
                    >
                      {time === "--" ? `号源 ${slot.slotSeq}` : time}
                    </button>
                  );
                })}
                {slots.length === 0 && <div className="col-span-3 text-sm text-gray-400 text-center py-4">当前场次暂无可用号源</div>}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe z-50 shadow-[0_-8px_20px_rgba(0,0,0,0.03)] max-w-md mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">预估挂号费</span>
            <span className="text-lg font-bold text-orange-500">¥ {selectedSession?.fee ?? "0.00"}</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!selectedSessionId || !selectedSlotId || submitting || slotsLoading}
            className="w-[200px] min-h-11 py-3.5 bg-[#00b96b] text-white rounded-xl font-medium active:bg-[#009e5b] disabled:opacity-50 transition-all flex items-center justify-center"
          >
            {submitting ? "提交中..." : "确认预约"}
          </button>
        </div>
      </div>
    </div>
  );
};
