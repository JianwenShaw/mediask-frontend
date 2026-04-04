import { Navigate } from "react-router";

import { AccessDenied } from "../components/access-denied";
import { useAuth } from "../auth/auth-context";

export const IndexPage = () => {
  const auth = useAuth();

  if (auth.hasAnyRole(["DOCTOR"])) {
    return <Navigate to="/workbench" replace />;
  }

  if (auth.hasAnyRole(["ADMIN"])) {
    return <Navigate to="/audit" replace />;
  }

  return <AccessDenied />;
};
