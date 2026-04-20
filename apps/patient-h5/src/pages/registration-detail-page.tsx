import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { RegistrationDetail } from "@mediask/shared-types";

import { patientFlowPaths } from "../flow/patient-flow-store";
import { patientApi } from "../lib/api";
import { formatApiDate, formatApiDateTime } from "../lib/date-time";

const periodLabels: Record<string, string> = {
  MORNING: "上午",
  AFTERNOON: "下午",
  EVENING: "晚上",
  ALL_DAY: "全天",
};

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: "待支付",
  CONFIRMED: "待就诊",
  CANCELLED: "已取消",
  COMPLETED: "已完成",
};

export const RegistrationDetailPage = () => {
  const navigate = useNavigate();
  const { registrationId } = useParams<{ registrationId: string }>();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<RegistrationDetail | null>(null);

  useEffect(() => {
    if (!registrationId) {
      navigate(patientFlowPaths.registrations, { replace: true });
      return;
    }

    let cancelled = false;
    setLoading(true);

    patientApi
      .getRegistration(registrationId)
      .then((result) => {
        if (cancelled) {
          return;
        }
        setDetail(result.data ?? null);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load registration detail", err);
          window.alert("挂号详情加载失败，请重试");
          navigate(patientFlowPaths.registrations, { replace: true });
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
  }, [navigate, registrationId]);

  const fields = useMemo(() => {
    if (!detail) {
      return [];
    }

    const createdAt = formatApiDateTime(detail.createdAt);
    const cancelledAt = detail.cancelledAt ? formatApiDateTime(detail.cancelledAt) : null;

    return [
      { label: "挂号单号", value: detail.orderNo || "-" },
      { label: "当前状态", value: statusLabels[detail.status] ?? detail.status },
      { label: "挂号时间", value: `${createdAt.date} ${createdAt.time}` },
      { label: "就诊科室", value: detail.departmentName ?? "-" },
      { label: "接诊医生", value: detail.doctorName ?? "-" },
      { label: "就诊日期", value: formatApiDate(detail.sessionDate) },
      { label: "就诊时段", value: detail.periodCode ? periodLabels[detail.periodCode] ?? detail.periodCode : "-" },
      { label: "挂号费用", value: `¥ ${detail.fee}` },
      { label: "取消时间", value: cancelledAt ? `${cancelledAt.date} ${cancelledAt.time}` : "-" },
      { label: "取消原因", value: detail.cancellationReason ?? "-" },
    ];
  }, [detail]);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen pb-safe">
      <header className="px-4 py-3 bg-white shadow-sm flex items-center sticky top-0 z-10 pt-safe">
        <button
          onClick={() => navigate(patientFlowPaths.registrations)}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700 active:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-semibold text-lg text-gray-900 ml-2">挂号详情</h1>
      </header>

      <div className="p-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
            <div className="space-y-4">
              {Array.from({ length: 7 }).map((_, idx) => (
                <div key={idx} className="h-5 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        ) : detail ? (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            {fields.map((field) => (
              <div key={field.label} className="flex items-start justify-between gap-4 text-sm">
                <span className="text-gray-500">{field.label}</span>
                <span className="text-gray-900 font-medium text-right break-all">{field.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex items-center justify-center text-sm text-gray-400">未找到挂号详情</div>
        )}
      </div>
    </div>
  );
};
