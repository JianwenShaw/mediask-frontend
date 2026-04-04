import { createBrowserRouter } from "react-router";

import { ProtectedRoute } from "./components/protected-route";
import { AppLayout } from "./layouts/app-layout";
import { AuditPage } from "./pages/audit-page";
import { EmrPage } from "./pages/emr-page";
import { EncounterDetailPage } from "./pages/encounter-detail-page";
import { EncountersPage } from "./pages/encounters-page";
import { ForbiddenPage } from "./pages/forbidden-page";
import { IndexPage } from "./pages/index-page";
import { LoginPage } from "./pages/login-page";
import { PrescriptionsPage } from "./pages/prescriptions-page";
import { WorkbenchPage } from "./pages/workbench-page";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/forbidden",
    element: (
      <ProtectedRoute>
        <ForbiddenPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <IndexPage /> },
      {
        path: "workbench",
        element: (
          <ProtectedRoute allowedRoles={["DOCTOR"]}>
            <WorkbenchPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "encounters",
        element: (
          <ProtectedRoute allowedRoles={["DOCTOR"]}>
            <EncountersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "encounters/:id",
        element: (
          <ProtectedRoute allowedRoles={["DOCTOR"]}>
            <EncounterDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "emr/:encounterId",
        element: (
          <ProtectedRoute allowedRoles={["DOCTOR"]}>
            <EmrPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "prescriptions/:encounterId",
        element: (
          <ProtectedRoute allowedRoles={["DOCTOR"]}>
            <PrescriptionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "audit",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AuditPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
