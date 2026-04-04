import { RoutePlaceholder } from "../components/route-placeholder";

export const EmrPage = () => {
  return (
    <RoutePlaceholder
      title="病历编辑"
      description="病历编辑页路由已固定，后续会承接结构化病历表单。"
      links={[
        { label: "查看处方页", to: "/prescriptions/demo-encounter" },
        { label: "返回接诊详情", to: "/encounters/demo-encounter" },
      ]}
    />
  );
};
