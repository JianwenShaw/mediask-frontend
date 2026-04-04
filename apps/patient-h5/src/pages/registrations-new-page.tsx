import { RoutePlaceholder } from "../components/route-placeholder";

export const RegistrationsNewPage = () => {
  return (
    <RoutePlaceholder
      title="挂号提交"
      description="这里会承接 AI 导诊生成的挂号参数，并接入 clinic sessions 与 registrations 接口。"
      links={[
        { label: "查看我的挂号", to: "/registrations" },
        { label: "返回导诊结果", to: "/triage/result/demo-session" },
      ]}
    />
  );
};
