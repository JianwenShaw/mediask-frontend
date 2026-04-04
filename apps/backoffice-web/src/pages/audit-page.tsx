import { RoutePlaceholder } from "../components/route-placeholder";

export const AuditPage = () => {
  return (
    <RoutePlaceholder
      title="审计查询"
      description="管理员审计页已拆出独立路由，后续会接入 audit_event 和 data_access_log 查询。"
      links={[
        { label: "返回工作台", to: "/workbench" },
        { label: "查看接诊列表", to: "/encounters" },
      ]}
    />
  );
};
