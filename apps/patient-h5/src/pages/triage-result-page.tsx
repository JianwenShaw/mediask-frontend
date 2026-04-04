import { RoutePlaceholder } from "../components/route-placeholder";

export const TriageResultPage = () => {
  return (
    <RoutePlaceholder
      title="导诊结果"
      description="导诊结果页会展示推荐科室、引用依据、风险级别和下一步动作。"
      links={[
        { label: "去挂号页", to: "/registrations/new" },
        { label: "返回问诊页", to: "/ai/session/demo-session" },
      ]}
    />
  );
};
