import { RoutePlaceholder } from "../components/route-placeholder";

export const RegistrationsPage = () => {
  return (
    <RoutePlaceholder
      title="我的挂号"
      description="挂号列表页会展示挂号记录、状态和对应的 AI 会话来源。"
      links={[
        { label: "继续挂号", to: "/registrations/new" },
        { label: "返回首页", to: "/" },
      ]}
    />
  );
};
