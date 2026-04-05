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

  const handleLogin = async (e: React.FormEvent) => {
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
    <div className="flex-1 flex flex-col px-6 py-12 bg-white">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">欢迎使用 MediAsk</h1>
        <p className="text-gray-500">智能分诊与预约系统</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6 flex-1 flex flex-col">
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              用户名
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00b96b]/20 focus:border-[#00b96b] transition-colors"
              placeholder="请输入用户名"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00b96b]/20 focus:border-[#00b96b] transition-colors"
              placeholder="请输入密码"
            />
          </div>
        </div>

        {errorText ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
            {errorText}
          </div>
        ) : null}

        <div className="mt-auto pt-6 pb-safe">
          <button
            type="submit"
            disabled={!username.trim() || !password || loading}
            className="w-full py-4 px-4 bg-[#00b96b] text-white rounded-full font-medium text-lg active:bg-[#009e5b] disabled:opacity-50 disabled:active:bg-[#00b96b] transition-all flex items-center justify-center"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {loading ? "登录中..." : "登录"}
          </button>
        </div>
      </form>
    </div>
  );
};
