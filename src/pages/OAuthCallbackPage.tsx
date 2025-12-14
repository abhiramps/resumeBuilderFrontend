/**
 * OAuth Callback Page
 * Handles the redirect from the OAuth provider and completes the login process.
 */

import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function useQuery() {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}

export const OAuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const { handleOAuthCallback, error } = useAuth();
    const query = useQuery();

    useEffect(() => {
        const code = query.get('code');
        if (code) {
            handleOAuthCallback(code)
                .then(() => {
                    navigate('/dashboard');
                })
                .catch((err) => {
                    console.error('OAuth callback error:', err);
                    navigate('/login');
                });
        } else {
            // No code found, redirect to login
            navigate('/login');
        }
    }, [handleOAuthCallback, navigate, query]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Completing authentication...</p>
                {error && <p className="mt-4 text-red-600">{error}</p>}
            </div>
        </div>
    );
};
