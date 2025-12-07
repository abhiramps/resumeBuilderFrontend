import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ResumeBackendProvider } from "./contexts/ResumeBackendContext";
import { QueryProvider } from "./lib/QueryProvider";
import { router } from "./router";
import "./index.css";

import { HelmetProvider } from "react-helmet-async";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryProvider>
        <AuthProvider>
          <ResumeBackendProvider>
            <RouterProvider router={router} />
          </ResumeBackendProvider>
        </AuthProvider>
      </QueryProvider>
    </HelmetProvider>
  </React.StrictMode>
);
