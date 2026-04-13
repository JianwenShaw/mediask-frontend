import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate, useParams } from "react-router";
import remarkGfm from "remark-gfm";

import {
  getTriageCompletionPath,
  patientFlowPaths,
  usePatientFlowStore,
} from "../flow/patient-flow-store";
import { patientApi, patientConnectAiChatStream } from "../lib/api";
import { parseAiMessageContent } from "../lib/parse-ai-message";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    role: "assistant",
    content: "您好，我是 MediAsk 智能助手。请问您今天有哪里不舒服？",
  },
];

const QUICK_REPLIES = ["我有些发热", "头晕恶心", "胸痛", "一直咳嗽"];

const remarkPlugins = [remarkGfm];
const markdownComponents: any = {
  p: ({ node, ...props }: any) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
  ul: ({ node, ...props }: any) => <ul className="list-disc pl-5 mb-2 space-y-1 marker:text-green-500" {...props} />,
  ol: ({ node, ...props }: any) => <ol className="list-decimal pl-5 mb-2 space-y-1 marker:text-green-500" {...props} />,
  li: ({ node, ...props }: any) => <li className="" {...props} />,
  strong: ({ node, ...props }: any) => <strong className="font-semibold text-gray-900" {...props} />,
  a: ({ node, ...props }: any) => <a className="underline decoration-1 underline-offset-2 text-green-600" {...props} />,
  h1: ({ node, ...props }: any) => <h1 className="text-xl font-bold mb-2 mt-4 first:mt-0 text-gray-900" {...props} />,
  h2: ({ node, ...props }: any) => <h2 className="text-lg font-bold mb-2 mt-4 first:mt-0 text-gray-900" {...props} />,
  h3: ({ node, ...props }: any) => <h3 className="text-base font-bold mb-2 mt-4 first:mt-0 text-gray-900" {...props} />,
  table: ({ node, ...props }: any) => (
    <div className="overflow-x-auto mb-2">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md" {...props} />
    </div>
  ),
  th: ({ node, ...props }: any) => <th className="bg-gray-50 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />,
  td: ({ node, ...props }: any) => <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 border-t border-gray-200" {...props} />,
  blockquote: ({ node, ...props }: any) => <blockquote className="border-l-4 border-green-500 pl-4 py-1 italic text-gray-600 bg-green-50 rounded-r-md" {...props} />
};

export const AiSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const startConsultation = usePatientFlowStore((state) => state.startConsultation);
  const completeTriage = usePatientFlowStore((state) => state.completeTriage);
  const resetFlow = usePatientFlowStore((state) => state.resetFlow);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [realSessionId, setRealSessionId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    startConsultation(sessionId);
    
    if (sessionId === "new") {
      setRealSessionId(null);
      setMessages(INITIAL_MESSAGES);
      setIsLoadingHistory(false);
      return;
    }
    
    setRealSessionId(sessionId);

    const loadHistory = async () => {
      try {
        const { data } = await patientApi.getAiSessionDetail(sessionId);
        
        if (data.turns && data.turns.length > 0) {
          const loadedMessages: Message[] = [];
          data.turns.forEach((turn: any) => {
            turn.messages.forEach((m: any) => {
              const parsedContent = parseAiMessageContent(m.content);

              loadedMessages.push({
                id: `${turn.turnId}-${loadedMessages.length}`,
                role: (m.role || "").toLowerCase() === "user" ? "user" : "assistant",
                content: parsedContent,
              });
            });
          });
          if (loadedMessages.length > 0) {
            setMessages(loadedMessages);
          }
        }
      } catch (error) {
        // Fallback or ignore
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    loadHistory();
  }, [sessionId, startConsultation]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping, isLoadingHistory]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput("");
    const userMsgId = Date.now().toString();
    setMessages((prev) => [...prev, { id: userMsgId, role: "user", content: userMsg }]);

    setIsTyping(true);
    const assistantMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantMsgId, role: "assistant", content: "", isStreaming: true },
    ]);

    try {
      await patientConnectAiChatStream({
        body: {
          sessionId: realSessionId,
          message: userMsg,
          departmentId: null,
          sceneType: "PRE_CONSULTATION",
          useStream: true,
        },
        onEvent: (event) => {
          if (event.event === "message") {
            const chunk = parseAiMessageContent(event.data);
            
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              )
            );
          } else if (event.event === "meta") {
            const data = event.data;
            if (data.sessionId) {
              setRealSessionId(data.sessionId);
              if (sessionId === "new") {
                navigate(patientFlowPaths.aiSession(data.sessionId), { replace: true });
              }
            }
            if (data.triageResult) {
              const triage = data.triageResult;
              const hasRecommendation = triage.recommendedDepartments && triage.recommendedDepartments.length > 0;
              const isHighRisk = triage.nextAction === "EMERGENCY_OFFLINE" || triage.nextAction === "MANUAL_SUPPORT";
              const isRegistration = triage.nextAction === "GO_REGISTRATION";
              
              if (hasRecommendation || isHighRisk || isRegistration) {
                completeTriage(data.sessionId || sessionId!, triage);
                navigate(getTriageCompletionPath(data.sessionId || sessionId!, triage), { replace: true });
              }
            }
          } else if (event.event === "end") {
            setIsTyping(false);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
              )
            );
          } else if (event.event === "error") {
            setIsTyping(false);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? {
                      ...msg,
                      isStreaming: false,
                      content: msg.content + "\n[发生错误: " + (event.data.msg || "未知") + "]",
                    }
                  : msg
              )
            );
          }
        },
      });
    } catch (e) {
      setIsTyping(false);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, isStreaming: false, content: msg.content + "\n[网络请求失败]" }
            : msg
        )
      );
    }
  };

  return (
    <div className="flex flex-col h-screen h-[100dvh] bg-[#f8fafc]">
      {/* Header */}
      <header className="px-4 py-3 bg-white shadow-sm flex items-center justify-between sticky top-0 z-10 pt-safe">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#E6F8F0] flex items-center justify-center text-[#00b96b]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h1 className="font-semibold text-lg text-gray-900 leading-tight">AI 智能问诊</h1>
            <span className="text-[11px] text-green-500 font-medium flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              医生助手在线
            </span>
          </div>
        </div>
        <button className="text-sm text-gray-500 hover:text-gray-700 font-medium bg-gray-50 px-3 py-1.5 rounded-full active:scale-95 transition-transform" onClick={() => {
          resetFlow();
          navigate(patientFlowPaths.home, { replace: true });
        }}>返回首页</button>
      </header>

      {/* Chat Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
      >
        {isLoadingHistory ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <div className="w-8 h-8 border-4 border-[#00b96b] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500">正在恢复聊天记录...</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 items-end ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-[#00b96b] text-white shadow-md shadow-green-900/10' : 'bg-[#E6F8F0] text-[#00b96b] border border-green-100'}`}>
                {msg.role === 'user' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[72%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-[#00b96b] text-white rounded-br-sm shadow-md shadow-green-900/10"
                    : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                }`}
              >
                <div className={`text-[15px] leading-relaxed ${msg.role === "user" ? "whitespace-pre-wrap" : ""}`}>
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <div className="markdown-body space-y-3">
                      <ReactMarkdown
                        remarkPlugins={remarkPlugins}
                        components={markdownComponents}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  {msg.isStreaming && (
                    <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-current animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing indicator */}
        {isTyping && !messages[messages.length - 1]?.isStreaming && (
          <div className="flex gap-3 flex-row items-end">
             <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center bg-[#E6F8F0] text-[#00b96b] border border-green-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
             </div>
             <div className="bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 px-4 py-4 flex items-center gap-1.5 h-[46px]">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100 p-4 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.02)] flex flex-col">
        {!isTyping && (
          <div className="overflow-x-auto whitespace-nowrap pb-3 -mx-4 px-4 no-scrollbar flex gap-2">
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                onClick={() => setInput(reply)}
                className="inline-block px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 shadow-sm active:scale-95 transition-transform shrink-0 font-medium"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="请输入您的症状 (输入'胸痛'触发高风险)..."
            className="flex-1 max-h-32 min-h-[44px] bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-[15px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00b96b]/30 focus:border-transparent transition-all resize-none shadow-inner disabled:opacity-50"
            rows={1}
            disabled={isTyping || isLoadingHistory}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping || isLoadingHistory}
            className="w-[44px] h-[44px] bg-[#00b96b] text-white rounded-full flex items-center justify-center shrink-0 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all shadow-md shadow-green-900/20"
          >
            <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
