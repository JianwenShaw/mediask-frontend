import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";

import "./app.css";
import { PatientAuthProvider } from "./auth/auth-provider";
import { router } from "./router";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <PatientAuthProvider>
      <RouterProvider router={router} />
    </PatientAuthProvider>
  </StrictMode>,
);
