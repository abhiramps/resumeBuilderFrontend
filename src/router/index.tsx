/**
 * Router Configuration
 * Defines all application routes
 */

import React from "react";
import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import {
  LandingPage,
  LoginPage,
  SignupPage,
  ForgotPasswordPage,
  EmailConfirmPage,
  DashboardPage,
  ProfilePage,
  EditorPage,
  SharePage,
  VersionsPage,
  TermsPage,
  PrivacyPolicyPage,
  OAuthCallbackPage,
  ResetPasswordPage,
} from "../pages";
import { useAuth } from "../contexts/AuthContext";
import { ResumeProvider } from "../contexts/ResumeContext";

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, pendingVerificationEmail } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Allow staying on signup page if verification is pending
  // This prevents redirect to dashboard when user hasn't verified email yet
  if (pendingVerificationEmail && location.pathname === "/signup") {
    return <>{children}</>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/terms",
    element: <TermsPage />,
  },
  {
    path: "/privacy-policy",
    element: <PrivacyPolicyPage />,
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <SignupPage />
      </PublicRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <PublicRoute>
        <ForgotPasswordPage />
      </PublicRoute>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <PublicRoute>
        <ResetPasswordPage />
      </PublicRoute>
    ),
  },
  {
    path: "/auth/confirm",
    element: (
      <PublicRoute>
        <EmailConfirmPage />
      </PublicRoute>
    ),
  },
  {
    path: "/auth/callback",
    element: (
      <PublicRoute>
        <OAuthCallbackPage />
      </PublicRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/editor/:id",
    element: (
      <ProtectedRoute>
        <ResumeProvider>
          <EditorPage />
        </ResumeProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/share/:id",
    element: (
      <ProtectedRoute>
        <SharePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/versions/:id",
    element: (
      <ProtectedRoute>
        <VersionsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
