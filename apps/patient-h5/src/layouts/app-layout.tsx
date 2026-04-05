import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";

import { usePatientAuthStore } from "../auth/auth-store";

const LayoutFrame = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex flex-col min-h-screen-safe w-full max-w-md mx-auto relative shadow-sm bg-white pt-safe">
      {children}
    </div>
  );
};

const LoadingScreen = ({ text }: { text: string }) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="h-10 w-10 rounded-full border-4 border-emerald-100 border-t-[#00b96b] animate-spin" />
      <div>
        <p className="text-base font-semibold text-gray-900">{text}</p>
        <p className="mt-1 text-sm text-gray-500">请稍候，正在同步您的患者端登录状态。</p>
      </div>
    </div>
  );
};

const ErrorScreen = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-1 flex-col justify-center px-6 py-12">
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6">
        <p className="text-sm font-semibold tracking-[0.14em] text-red-500">初始化失败</p>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">无法验证当前登录状态</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">{message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 min-h-[48px] w-full rounded-xl bg-[#00b96b] px-4 py-3 text-base font-medium text-white active:bg-[#009e5b]"
        >
          重新加载
        </button>
      </div>
    </div>
  );
};

const ForbiddenScreen = ({
  displayName,
  onLogout,
}: {
  displayName: string;
  onLogout: () => void;
}) => {
  return (
    <div className="flex flex-1 flex-col justify-center px-6 py-12">
      <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6">
        <p className="text-sm font-semibold tracking-[0.14em] text-amber-600">访问受限</p>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">当前账号没有患者端访问权限</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          {displayName} 已通过认证，但角色不包含患者身份，无法进入患者端主链路。请更换患者账号后重试。
        </p>
        <button
          type="button"
          onClick={onLogout}
          className="mt-6 min-h-[48px] w-full rounded-xl bg-[#00b96b] px-4 py-3 text-base font-medium text-white active:bg-[#009e5b]"
        >
          退出登录
        </button>
      </div>
    </div>
  );
};

export const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const status = usePatientAuthStore((state) => state.status);
  const bootstrapError = usePatientAuthStore((state) => state.bootstrapError);
  const user = usePatientAuthStore((state) => state.user);
  const logout = usePatientAuthStore((state) => state.clearSession);
  const isLoginPage = location.pathname === "/login";

  useEffect(() => {
    if (status === "anonymous" && !isLoginPage) {
      navigate("/login", { replace: true });
    } else if (status === "authenticated" && isLoginPage) {
      navigate("/", { replace: true });
    }
  }, [isLoginPage, navigate, status]);

  if (status === "bootstrapping") {
    return (
      <LayoutFrame>
        <LoadingScreen text="正在验证登录状态" />
      </LayoutFrame>
    );
  }

  if (status === "bootstrap_error") {
    return (
      <LayoutFrame>
        <ErrorScreen message={bootstrapError ?? "当前登录状态校验失败，请稍后重试。"} />
      </LayoutFrame>
    );
  }

  if (status === "forbidden") {
    return (
      <LayoutFrame>
        <ForbiddenScreen
          displayName={user?.displayName || user?.username || "当前账号"}
          onLogout={logout}
        />
      </LayoutFrame>
    );
  }

  if ((status === "anonymous" && !isLoginPage) || (status === "authenticated" && isLoginPage)) {
    return (
      <LayoutFrame>
        <LoadingScreen text="正在跳转页面" />
      </LayoutFrame>
    );
  }

  return (
    <LayoutFrame>
      <Outlet />
    </LayoutFrame>
  );
};
