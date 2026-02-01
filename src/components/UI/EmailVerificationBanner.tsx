/**
 * Email Verification Banner
 * Persistent banner shown after signup until email is verified
 */

import React, { useState, useEffect, useCallback } from 'react';
// import { Button } from './Button';
// import { Input } from './Input';
import { API_CONFIG } from '../../config/api.config';

interface EmailVerificationBannerProps {
    /** User's email address */
    email: string;
    /** Callback when user clicks "Change Email" */
    onChangeEmail?: () => void;
    /** Callback when verification is completed */
    onVerificationComplete?: () => void;
    /** Callback when user dismisses the banner */
    onDismiss?: () => void;
    /** Whether to show dismiss option (only after verification or user action) */
    allowDismiss?: boolean;
    /** Custom className for styling */
    className?: string;
}

/*
interface ResendState {
    isLoading: boolean;
    lastSentAt: number | null;
    error: string | null;
    success: string | null;
    nextAttemptAt: number | null;
}
*/

export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
    // email,
    // onChangeEmail,
    onVerificationComplete,
    // onDismiss,
    // allowDismiss = false,
    // className = '',
}) => {
    /*
    const [resendState, setResendState] = useState<ResendState>({
        isLoading: false,
        lastSentAt: null,
        error: null,
        success: null,
        nextAttemptAt: null,
    });
    */
    const [isPolling, setIsPolling] = useState(false);
    // const [showChangeEmail, setShowChangeEmail] = useState(false);
    // const [newEmail, setNewEmail] = useState('');

    // Check verification status
    const checkVerificationStatus = useCallback(async () => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.SESSION}`);
            if (response.ok) {
                const data = await response.json();
                if (data.user?.isEmailVerified) {
                    onVerificationComplete?.();
                    return true;
                }
            }
        } catch (error) {
            console.error('Failed to check verification status:', error);
        }
        return false;
    }, [onVerificationComplete]);

    // Poll for verification status every 30 seconds
    useEffect(() => {
        const pollInterval = setInterval(async () => {
            if (!isPolling) return;
            const isVerified = await checkVerificationStatus();
            if (isVerified) {
                setIsPolling(false);
            }
        }, 30000); // 30 seconds

        return () => clearInterval(pollInterval);
    }, [checkVerificationStatus, isPolling]);

    // Start polling when component mounts - DISABLED as per request to remove unwanted network calls
    useEffect(() => {
        // setIsPolling(true);
        return () => setIsPolling(false);
    }, []);

    /*
    // Handle resend verification email
    const handleResendEmail = async () => {
        setResendState(prev => ({ ...prev, isLoading: true, error: null, success: null }));

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.RESEND_VERIFICATION}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setResendState(prev => ({
                    ...prev,
                    isLoading: false,
                    lastSentAt: Date.now(),
                    success: 'Verification email sent successfully!',
                    nextAttemptAt: data.nextAttemptAt || null,
                    error: null,
                }));
            } else {
                setResendState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: data.error?.message || 'Failed to send verification email',
                    success: null,
                    nextAttemptAt: data.error?.waitTime ? Date.now() + (data.error.waitTime * 1000) : null,
                }));
            }
        } catch (error) {
            setResendState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Network error. Please try again.',
                success: null,
            }));
        }
    };

    // Handle manual verification check
    const handleManualCheck = async () => {
        setIsPolling(true);
        const isVerified = await checkVerificationStatus();
        if (!isVerified) {
            setResendState(prev => ({
                ...prev,
                error: 'Email not verified yet. Please check your inbox and spam folder.',
            }));
        }
    };

    // Handle change email
    const handleChangeEmail = async () => {
        if (!newEmail.trim()) return;

        // In a real app, you'd call an API to update the email
        // For now, just call the callback
        onChangeEmail?.();
        setShowChangeEmail(false);
        setNewEmail('');
    };

    // Calculate time until next resend is allowed
    const getTimeUntilNextResend = () => {
        if (!resendState.nextAttemptAt) return 0;
        return Math.max(0, Math.ceil((resendState.nextAttemptAt - Date.now()) / 1000));
    };

    const timeUntilNextResend = getTimeUntilNextResend();
    const canResend = timeUntilNextResend === 0 && !resendState.isLoading;
    */

    // TEMPORARY: Disable verification banner for all users as requested
    return null;

    /* Original Banner Logic - Commented out for now
    return (
        <div className={`bg-blue-50 border-l-4 border-blue-400 p-4 ${className}`}>
            <div className="flex items-start">
    ...
            </div>
        </div>
    );
    */
};


