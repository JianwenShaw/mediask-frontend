import { RoutePlaceholder } from "../components/route-placeholder";

export const TriageHighRiskPage = () => {
  return (
    <RoutePlaceholder
      title="高风险提示"
      description="高风险分支已经拆成独立路由，后续只承接紧急就医或人工求助动作。"
      links={[
        { label: "回到首页", to: "/" },
        { label: "查看挂号页", to: "/registrations/new" },
      ]}
    >
      <div className="rounded-3xl border border-red-100 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
        当前页面仅作为独立高风险出口，不会继续普通问诊交互。
      </div>
    </RoutePlaceholder>
  );
};
