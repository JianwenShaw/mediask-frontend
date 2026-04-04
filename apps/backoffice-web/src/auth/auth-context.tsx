import type { AuthRole, LoginResponse, UserContext } from "@mediask/shared-types";
import { ApiError } from "@mediask/api-client";
import { Button, Result, Spin } from "antd";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { backofficeApi } from "../lib/api";
import {
  clearStoredAuthState,
  readStoredAuthState,
  setStoredAuthSession,
  subscribeAuthChange,
  updateStoredAuthUser,
  type StoredAuthState,
} from "./auth-store";

type AuthStatus =
  | "anonymous"
  | "bootstrapping"
  | "authenticated"
  | "bootstrap_error";

type AuthContextValue = StoredAuthState & {
  status: AuthStatus;
  bootstrapError: string | null;
  completeLogin: (loginResponse: LoginResponse) => void;
  logout: () => void;
  hasAnyRole: (roles: AuthRole[]) => boolean;
  hasBackofficeAccess: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const AuthBootstrapFallback = ({ message }: { message: string }) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Result
        status="500"
        title="登录态初始化失败"
        subTitle={message}
        extra={
          <Button type="primary" onClick={() => window.location.reload()}>
            重新加载
          </Button>
        }
      />
    </div>
  );
};

const AuthBootstrapLoading = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <Spin size="large" />
      <span>正在验证登录状态...</span>
    </div>
  );
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [storedState, setStoredState] = useState<StoredAuthState>(() => readStoredAuthState());
  const [status, setStatus] = useState<AuthStatus>(() =>
    readStoredAuthState().accessToken ? "bootstrapping" : "anonymous",
  );
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeAuthChange(() => {
      const nextState = readStoredAuthState();
      setStoredState(nextState);

      if (!nextState.accessToken) {
        setStatus("anonymous");
        setBootstrapError(null);
      }
    });
  }, []);

  useEffect(() => {
    if (!storedState.accessToken) {
      setStatus("anonymous");
      setBootstrapError(null);
      return;
    }

    if (status === "authenticated" && storedState.user) {
      return;
    }

    let cancelled = false;

    setStatus("bootstrapping");
    setBootstrapError(null);

    void backofficeApi
      .getCurrentUser()
      .then((result) => {
        if (cancelled) {
          return;
        }

        updateStoredAuthUser(result.data);
        setStatus("authenticated");
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          setStatus("anonymous");
          return;
        }

        setStatus("bootstrap_error");
        setBootstrapError(error instanceof Error ? error.message : "当前用户信息加载失败");
      });

    return () => {
      cancelled = true;
    };
  }, [storedState.accessToken, storedState.user]);

  const value = useMemo<AuthContextValue>(() => {
    const currentRoles = storedState.user?.roles ?? [];

    return {
      ...storedState,
      status,
      bootstrapError,
      completeLogin(loginResponse) {
        setStoredAuthSession(loginResponse);
        setStatus("authenticated");
        setBootstrapError(null);
      },
      logout() {
        clearStoredAuthState();
      },
      hasAnyRole(roles) {
        if (roles.length === 0) {
          return true;
        }

        return roles.some((role) => currentRoles.includes(role));
      },
      hasBackofficeAccess:
        currentRoles.includes("DOCTOR") || currentRoles.includes("ADMIN"),
    };
  }, [bootstrapError, status, storedState]);

  if (bootstrapError) {
    return <AuthBootstrapFallback message={bootstrapError} />;
  }

  if (status === "bootstrapping") {
    return <AuthBootstrapLoading />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
