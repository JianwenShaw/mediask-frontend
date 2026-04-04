import { RoutePlaceholder } from "../components/route-placeholder";

export const IndexPage = () => {
  return (
    <RoutePlaceholder
      title="患者端主链路骨架"
      description="当前阶段已完成 patient-h5 应用拆分，后续任务会在这个应用内补齐登录、问诊、导诊和挂号流程。"
      links={[
        { label: "登录页", to: "/login" },
        { label: "AI 问诊页", to: "/ai/session/demo-session" },
        { label: "导诊结果页", to: "/triage/result/demo-session" },
        { label: "高风险提示页", to: "/triage/high-risk/demo-session" },
        { label: "挂号提交页", to: "/registrations/new" },
        { label: "我的挂号", to: "/registrations" },
      ]}
    >
      <div className="space-y-3 text-sm leading-6 text-slate-600">
        <p>已预留 P0 患者链路的全部正式路由。</p>
        <p>后续页面会直接按接口契约承接真实流程，而不是继续使用模板页。</p>
      </div>
    </RoutePlaceholder>
  );
};
