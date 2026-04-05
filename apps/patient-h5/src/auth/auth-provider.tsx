import { ApiError } from "@mediask/api-client";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";

import { patientApi } from "../lib/api";
import { usePatientAuthStore } from "./auth-store";

export const PatientAuthProvider = ({ children }: PropsWithChildren) => {
  const accessToken = usePatientAuthStore((state) => state.accessToken);
  const status = usePatientAuthStore((state) => state.status);
  const setBootstrapping = usePatientAuthStore((state) => state.setBootstrapping);
  const syncCurrentUser = usePatientAuthStore((state) => state.syncCurrentUser);
  const setBootstrapError = usePatientAuthStore((state) => state.setBootstrapError);
  const clearSession = usePatientAuthStore((state) => state.clearSession);

  useEffect(() => {
    if (!accessToken) {
      if (status !== "anonymous") {
        clearSession();
      }
      return;
    }

    if (status === "authenticated" || status === "forbidden" || status === "bootstrap_error") {
      return;
    }

    let cancelled = false;
    setBootstrapping();

    void patientApi
      .getCurrentUser()
      .then((result) => {
        if (cancelled) {
          return;
        }

        syncCurrentUser(result.data);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          return;
        }

        if (error instanceof ApiError && error.requestId) {
          setBootstrapError(`${error.message} (requestId: ${error.requestId})`);
          return;
        }

        setBootstrapError(
          error instanceof Error ? error.message : "当前登录状态校验失败，请稍后重试。",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, clearSession, setBootstrapping, setBootstrapError, status, syncCurrentUser]);

  return children;
};
