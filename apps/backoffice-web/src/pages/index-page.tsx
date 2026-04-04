import { RoutePlaceholder } from "../components/route-placeholder";

export const IndexPage = () => {
  return (
    <RoutePlaceholder
      title="医生 / 管理端骨架"
      description="后台应用已从单应用模板中拆出，正式路由和页面边界已经固定。"
      links={[
        { label: "工作台", to: "/workbench" },
        { label: "接诊列表", to: "/encounters" },
        { label: "审计页", to: "/audit" },
      ]}
    >
      <p className="text-sm leading-7 text-slate-600">
        下一阶段会在这些固定路由上补齐医生工作台、接诊详情、病历、处方和管理员审计查询。
      </p>
    </RoutePlaceholder>
  );
};
