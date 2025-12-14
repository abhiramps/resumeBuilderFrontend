

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const OAuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, error } = useAuth();

    // If authenticated, PublicRoute will handle redirect to /dashboard.
    // Use this effect for error handling or timeout.
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        // Fallback timeout if auth doesn't happen
        const timer = setTimeout(() => {
            if (!isAuthenticated) {
                console.error("OAuth callback timeout");
                navigate('/login?error=timeout');
            }
        }, 10000); // 10 seconds timeout

        return () => clearTimeout(timer);
    }, [isAuthenticated, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Completing authentication...</p>
                {error && <p className="mt-4 text-red-600">{error}</p>}
                <p className="mt-2 text-sm text-gray-500">Please wait while we verify your account.</p>
            </div>
        </div>
    );
};
