import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { mockGetTriageResult } from "../services/mock/api";

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

const MOCK_REPLIES = [
  "了解了。除了头痛，您还有发热、咳嗽或者恶心的症状吗？",
  "好的。根据您的描述，我已经为您生成了初步的导诊建议。",
];

const QUICK_REPLIES = ["我有些发热", "头晕恶心", "胸痛", "一直咳嗽"];

export const AiSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [replyCount, setReplyCount] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const simulateStream = async (text: string, onComplete?: () => Promise<void> | void) => {
    setIsTyping(true);
    const msgId = Date.now().toString();
    setMessages((prev) => [...prev, { id: msgId, role: "assistant", content: "", isStreaming: true }]);

    let currentText = "";
    for (let i = 0; i < text.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 30 + Math.random() * 50));
      currentText += text[i];
      setMessages((prev) =>
        prev.map((msg) => (msg.id === msgId ? { ...msg, content: currentText } : msg))
      );
    }

    setMessages((prev) =>
      prev.map((msg) => (msg.id === msgId ? { ...msg, isStreaming: false } : msg))
    );
    if (onComplete) {
      await onComplete();
    }
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: userMsg }]);

    setIsTyping(true); // Show typing indicator before streaming
    
    if (replyCount === 0) {
      setReplyCount(1);
      await new Promise((resolve) => setTimeout(resolve, 800)); // simulate thinking
      await simulateStream(MOCK_REPLIES[0]);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 800)); // simulate thinking
      await simulateStream(MOCK_REPLIES[1], async () => {
        // Mock checking for high risk vs normal
        const isHighRisk = userMsg.includes("胸痛") || userMsg.includes("晕倒");
        const triage = await mockGetTriageResult(sessionId!, isHighRisk ? 'high' : undefined);
        
        if (triage.nextAction === "EMERGENCY_OFFLINE") {
          navigate(`/triage/high-risk/${sessionId}`);
        } else {
          navigate(`/triage/result/${sessionId}`);
        }
      });
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
          navigate("/");
        }}>返回首页</button>
      </header>

      {/* Chat Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
      >
        {messages.map((msg) => (
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
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                {msg.content}
                {msg.isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-current animate-pulse" />
                )}
              </div>
            </div>
          </div>
        ))}
        
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
            className="flex-1 max-h-32 min-h-[44px] bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-[15px] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00b96b]/30 focus:border-transparent transition-all resize-none shadow-inner"
            rows={1}
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
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
