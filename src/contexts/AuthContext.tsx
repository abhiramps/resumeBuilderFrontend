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
import { supabase } from '../lib/supabase';
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
   * Initialize auth state on mount and listen for changes
   */
  useEffect(() => {
    let mounted = true;

    // Check for initial session (handling OAuth redirect automatically via Supabase client)
    const initAuth = async () => {
      try {
          if (authService.isAuthenticated()) {
             const session = await authService.getSession();
             if (mounted) setUser(session.user);
          } else {
             const storedUser = authService.getStoredUser();
             if (mounted && storedUser) setUser(storedUser);
          }
      } catch (err) {
        if (mounted) {
            await authService.signOut();
            setUser(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    
    initAuth();

    // Set up real-time auth listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // console.log('Auth event:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session) {
        // Sync with backend whenever we get a new session (login, oauth, etc)
        try {
            const data = await authService.syncWithBackend(session);
            if (mounted) setUser(data.user);
        } catch (err) {
            console.error('Failed to sync auth state:', err);
            // Fallback to supabase user if sync fails? 
            // syncWithBackend already handles fallback.
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
        err.message || err.response?.data?.error?.message || "Login failed. Please try again.";
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
          err.message ||
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
        err.message || err.response?.data?.error?.message || "Failed to refresh session.";
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
            const errorMessage = err.message || err.response?.data?.error?.message || 'OAuth login failed. Please try again.';
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
