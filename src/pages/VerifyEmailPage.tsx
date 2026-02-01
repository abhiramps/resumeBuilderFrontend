import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/UI/Button';
import { API_CONFIG } from '../config/api.config';
import { useAuth } from '../contexts/AuthContext';

export const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refreshAuth } = useAuth();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMessage('No verification token provided.');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.VERIFY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                if (response.ok) {
                    setStatus('success');
                    // Refresh auth state to update verification status in context
                    await refreshAuth();
                } else {
                    const data = await response.json();
                    setStatus('error');
                    setErrorMessage(data.error?.message || 'Verification failed. The link may be invalid or expired.');
                }
            } catch (error) {
                setStatus('error');
                setErrorMessage('Network error. Please try again later.');
            }
        };

        verifyEmail();
    }, [token, refreshAuth]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
                {status === 'verifying' && (
                    <div className="space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <h2 className="text-2xl font-bold text-gray-900">Verifying your email...</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
                        <p className="text-gray-600">Your email has been successfully verified. You can now access all features.</p>
                        <Button 
                            variant="primary" 
                            className="w-full"
                            onClick={() => navigate('/dashboard')}
                        >
                            Continue to Dashboard
                        </Button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
                        <p className="text-red-600">{errorMessage}</p>
                        <Button 
                            variant="secondary" 
                            className="w-full"
                            onClick={() => navigate('/dashboard')}
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
