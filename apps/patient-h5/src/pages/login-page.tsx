import { RoutePlaceholder } from "../components/route-placeholder";

export const LoginPage = () => {
  return (
    <RoutePlaceholder
      title="登录 / 身份确认"
      description="P0 登录页入口，后续将接入 /api/v1/auth/login 和 /api/v1/auth/me。"
      links={[
        { label: "进入 AI 问诊页", to: "/ai/session/demo-session" },
        { label: "返回首页", to: "/" },
      ]}
    />
  );
};
