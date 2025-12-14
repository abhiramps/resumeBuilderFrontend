/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authService } from "../services/auth.service";
import { API_CONFIG } from "../config/api.config";
import type { User, AuthState } from "../types/auth.types";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  loginWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  handleOAuthCallback: (code: string) => Promise<void>;
  // Email verification
  isEmailVerified: boolean;
  pendingVerificationEmail: string | null;
  resendVerificationEmail: (email: string) => Promise<void>;
  checkEmailVerification: (email: string) => Promise<boolean>;
  setPendingVerification: (email: string) => void;
  clearPendingVerification: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<
    string | null
  >(null);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is authenticated
        if (authService.isAuthenticated()) {
          // Try to get current session
          const session = await authService.getSession();
          setUser(session.user);
        } else {
          // Check for stored user data
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (err) {
        // If session check fails, clear auth
        await authService.signOut();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.signIn({ email, password });

      if (response.user) {
        setUser(response.user);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message || "Login failed. Please try again.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Signup new user
   */
  const signup = useCallback(
    async (email: string, password: string, fullName?: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await authService.signUp({
          email,
          password,
          fullName,
        });

        // If email verification is required, don't set user state or store tokens
        // Instead, set pending verification email so the UI can show the verification banner
        if (response.requiresEmailVerification || !response.session) {
          setPendingVerification(email);
          // Don't set user state - this prevents redirect to dashboard
          return;
        }

        // Only set user state if we have a valid session and email is verified
        if (response.user && response.session) {
          setUser(response.user);
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error?.message ||
          "Signup failed. Please try again.";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.signOut();
      setUser(null);
      setError(null);
    } catch (err: any) {
      console.error("Logout error:", err);
      // Still clear user state even if API call fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh authentication state
   */
  const refreshAuth = useCallback(async () => {
    try {
      const session = await authService.getSession();
      setUser(session.user);
      setError(null);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message || "Failed to refresh session.";
      setError(errorMessage);
      // If refresh fails, logout
      await logout();
    }
  }, [logout]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Resend verification email
   */
  const resendVerificationEmail = useCallback(async (email: string) => {
    try {
      setError(null);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/verification/resend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error?.message || "Failed to resend verification email"
        );
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to resend verification email";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Check email verification status
   */
  const checkEmailVerification = useCallback(
    async (email: string): Promise<boolean> => {
      try {
        const response = await fetch(
          `${
            API_CONFIG.BASE_URL
          }/verification/status?email=${encodeURIComponent(email)}`
        );
        if (response.ok) {
          const data = await response.json();
          return data.verified || false;
        }
        return false;
      } catch (error) {
        console.error("Failed to check verification status:", error);
        return false;
      }
    },
    []
  );

  /**
   * Set pending verification email
   */
  const setPendingVerification = useCallback((email: string) => {
    setPendingVerificationEmail(email);
  }, []);

  /**
   * Clear pending verification state
   */
  const clearPendingVerification = useCallback(() => {
    setPendingVerificationEmail(null);
  }, []);

    const loginWithOAuth = useCallback(async (provider: 'google' | 'github') => {
        try {
            setIsLoading(true);
            setError(null);
            const { url } = await authService.signInWithOAuth(provider);
            window.location.href = url;
        } catch (err: any) {
            const errorMessage = err.response?.data?.error?.message || 'OAuth login failed. Please try again.';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleOAuthCallback = useCallback(async (code: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await authService.handleOAuthCallback(code);
            if (response.user) {
                setUser(response.user);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error?.message || 'OAuth callback failed. Please try again.';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

  /**
   * Check if email is verified
   */
  const isEmailVerified = !!(user?.email_confirmed_at || user?.confirmed_at);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    signup,
    logout,
    refreshAuth,
    clearError,
    loginWithOAuth,
    handleOAuthCallback,
    isEmailVerified,
    pendingVerificationEmail,
    resendVerificationEmail,
    checkEmailVerification,
    setPendingVerification,
    clearPendingVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
