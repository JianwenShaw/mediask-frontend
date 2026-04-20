import { createBrowserRouter } from "react-router";

import { AppLayout } from "./layouts/app-layout";
import { AiSessionPage } from "./pages/ai-session-page";
import { AiSessionsPage } from "./pages/ai-sessions-page";
import { IndexPage } from "./pages/index-page";
import { LoginPage } from "./pages/login-page";
import { RegistrationDetailPage } from "./pages/registration-detail-page";
import { RegistrationsNewPage } from "./pages/registrations-new-page";
import { RegistrationsPage } from "./pages/registrations-page";
import { TriageHighRiskPage } from "./pages/triage-high-risk-page";
import { TriageResultPage } from "./pages/triage-result-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <IndexPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "ai/sessions", element: <AiSessionsPage /> },
      { path: "ai/session/:sessionId", element: <AiSessionPage /> },
      { path: "triage/result/:sessionId", element: <TriageResultPage /> },
      {
        path: "triage/high-risk/:sessionId",
        element: <TriageHighRiskPage />,
      },
      { path: "registrations/new", element: <RegistrationsNewPage /> },
      { path: "registrations/:registrationId", element: <RegistrationDetailPage /> },
      { path: "registrations", element: <RegistrationsPage /> },
    ],
  },
]);
