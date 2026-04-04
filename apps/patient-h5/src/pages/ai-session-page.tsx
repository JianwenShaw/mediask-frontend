import { RoutePlaceholder } from "../components/route-placeholder";

export const AiSessionPage = () => {
  return (
    <RoutePlaceholder
      title="AI 问诊"
      description="这里将承接 SSE 流式问诊、结构化 triageResult 和风险分流。"
      links={[
        { label: "查看导诊结果", to: "/triage/result/demo-session" },
        { label: "查看高风险页", to: "/triage/high-risk/demo-session" },
      ]}
    >
      <div className="space-y-3 text-sm leading-6 text-slate-600">
        <p>后续实现会只信任 `meta.triageResult`，不会从聊天文本推断业务决策。</p>
        <p>断流或报错时需要保留会话历史和 `requestId`。</p>
      </div>
    </RoutePlaceholder>
  );
};
