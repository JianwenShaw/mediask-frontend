import { RoutePlaceholder } from "../components/route-placeholder";

export const PrescriptionsPage = () => {
  return (
    <RoutePlaceholder
      title="处方编辑"
      description="处方页路由已固定，后续会承接处方头和处方项录入。"
      links={[
        { label: "返回接诊详情", to: "/encounters/demo-encounter" },
        { label: "查看审计页", to: "/audit" },
      ]}
    />
  );
};
