import { ApiError } from "@mediask/api-client";
import { useState } from "react";
import { useNavigate } from "react-router";

import { usePatientAuthStore } from "../auth/auth-store";
import { patientApi } from "../lib/api";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const navigate = useNavigate();
  const completeLogin = usePatientAuthStore((state) => state.completeLogin);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setLoading(true);
    setErrorText(null);

    try {
      const result = await patientApi.login({
        username: username.trim(),
        password,
      });

      completeLogin(result.data);
      navigate("/", { replace: true });
    } catch (error: unknown) {
      if (error instanceof ApiError && error.requestId) {
        setErrorText(`${error.message} (requestId: ${error.requestId})`);
      } else if (error instanceof Error) {
        setErrorText(error.message);
      } else {
        setErrorText("登录失败，请稍后重试。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* 头部区域 */}
      <div className="px-6 pt-16 pb-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-[#00b96b] to-[#009e5b] rounded-2xl flex items-center justify-center shadow-lg shadow-[#00b96b]/30 mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">欢迎使用 MediAsk</h1>
        <p className="text-gray-500 text-sm">您的智能分诊与预约贴心助手</p>
      </div>

      {/* 表单卡片区域 */}
      <div className="flex-1 flex flex-col px-4 pb-safe">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col relative z-10">
          <form onSubmit={handleLogin} className="space-y-6 flex-1 flex flex-col">
            <div className="space-y-5 mt-2">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                  用户名
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b96b]/20 focus:border-[#00b96b] transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="请输入用户名"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                  密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b96b]/20 focus:border-[#00b96b] transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="请输入密码"
                  />
                </div>
              </div>
            </div>

            {errorText ? (
              <div className="rounded-xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm leading-relaxed text-red-600 flex items-start">
                <svg
                  className="w-5 h-5 text-red-500 mr-2 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorText}</span>
              </div>
            ) : null}

            <div className="mt-auto pt-8">
              <button
                type="submit"
                disabled={!username.trim() || !password || loading}
                className="w-full py-4 px-4 bg-[#00b96b] text-white rounded-full font-medium text-lg active:scale-[0.98] active:bg-[#009e5b] disabled:opacity-50 disabled:active:scale-100 disabled:active:bg-[#00b96b] shadow-md shadow-[#00b96b]/20 transition-all flex items-center justify-center"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : null}
                {loading ? "登录中..." : "登录"}
              </button>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  className="text-sm text-gray-500 hover:text-[#00b96b] active:text-[#009e5b] transition-colors"
                >
                  遇到问题？
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
