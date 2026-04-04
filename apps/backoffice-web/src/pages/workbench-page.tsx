import { RoutePlaceholder } from "../components/route-placeholder";

export const WorkbenchPage = () => {
  return (
    <RoutePlaceholder
      title="工作台"
      description="工作台路由已落位，后续承接最小导航和待接诊入口。"
      links={[
        { label: "进入接诊列表", to: "/encounters" },
        { label: "查看审计页", to: "/audit" },
      ]}
    />
  );
};
