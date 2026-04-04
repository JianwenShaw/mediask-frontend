import { RoutePlaceholder } from "../components/route-placeholder";

export const EncountersPage = () => {
  return (
    <RoutePlaceholder
      title="接诊列表"
      description="这里会对接接诊列表和接诊详情入口。"
      links={[
        { label: "查看接诊详情", to: "/encounters/demo-encounter" },
        { label: "返回工作台", to: "/workbench" },
      ]}
    />
  );
};
