import { createBrowserRouter } from "react-router";

import { AppLayout } from "./layouts/app-layout";
import { AuditPage } from "./pages/audit-page";
import { EmrPage } from "./pages/emr-page";
import { EncounterDetailPage } from "./pages/encounter-detail-page";
import { EncountersPage } from "./pages/encounters-page";
import { IndexPage } from "./pages/index-page";
import { PrescriptionsPage } from "./pages/prescriptions-page";
import { WorkbenchPage } from "./pages/workbench-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <IndexPage /> },
      { path: "workbench", element: <WorkbenchPage /> },
      { path: "encounters", element: <EncountersPage /> },
      { path: "encounters/:id", element: <EncounterDetailPage /> },
      { path: "emr/:encounterId", element: <EmrPage /> },
      {
        path: "prescriptions/:encounterId",
        element: <PrescriptionsPage />,
      },
      { path: "audit", element: <AuditPage /> },
    ],
  },
]);
