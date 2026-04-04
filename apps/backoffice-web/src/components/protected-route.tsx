import type { AuthRole } from "@mediask/shared-types";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

import { useAuth } from "../auth/auth-context";
import { AccessDenied } from "./access-denied";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AuthRole[];
}

export const ProtectedRoute = ({
  children,
  allowedRoles = [],
}: ProtectedRouteProps) => {
  const location = useLocation();
  const auth = useAuth();

  if (auth.status === "anonymous") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!auth.hasAnyRole(allowedRoles)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};
