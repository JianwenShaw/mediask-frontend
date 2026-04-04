import { RoutePlaceholder } from "../components/route-placeholder";

export const EncounterDetailPage = () => {
  return (
    <RoutePlaceholder
      title="接诊详情 / AI 摘要"
      description="该路由后续展示挂号信息、接诊详情和 AI 摘要，不直接暴露 AI 原文。"
      links={[
        { label: "去写病历", to: "/emr/demo-encounter" },
        { label: "去开处方", to: "/prescriptions/demo-encounter" },
      ]}
    />
  );
};
