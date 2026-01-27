/**
 * Email Verification Banner
 * Persistent banner shown after signup until email is verified
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './Button';
import { Input } from './Input';

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

interface ResendState {
    isLoading: boolean;
    lastSentAt: number | null;
    error: string | null;
    success: string | null;
    nextAttemptAt: number | null;
}

export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
    email,
    onChangeEmail,
    onVerificationComplete,
    onDismiss,
    allowDismiss = false,
    className = '',
}) => {
    const [resendState, setResendState] = useState<ResendState>({
        isLoading: false,
        lastSentAt: null,
        error: null,
        success: null,
        nextAttemptAt: null,
    });
    const [isPolling, setIsPolling] = useState(false);
    const [showChangeEmail, setShowChangeEmail] = useState(false);
    const [newEmail, setNewEmail] = useState('');

    // Check verification status
    const checkVerificationStatus = useCallback(async () => {
        try {
            const response = await fetch(`/api/verification/status?email=${encodeURIComponent(email)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.verified) {
                    onVerificationComplete?.();
                    return true;
                }
            }
        } catch (error) {
            console.error('Failed to check verification status:', error);
        }
        return false;
    }, [email, onVerificationComplete]);

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

    // Handle resend verification email
    const handleResendEmail = async () => {
        setResendState(prev => ({ ...prev, isLoading: true, error: null, success: null }));

        try {
            const response = await fetch('/api/verification/resend', {
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

    return (
        <div className={`bg-blue-50 border-l-4 border-blue-400 p-4 ${className}`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-blue-800">
                        Please verify your email
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                        <p>
                            We sent a verification link to{' '}
                            <span className="font-medium">{email}</span>
                        </p>
                        <p className="mt-1">
                            Click the link in the email to verify your account and start building your resume.
                        </p>
                        <p className="mt-1 font-medium">
                            Please check your spam folder if you do not see the email.
                        </p>
                    </div>

                    {/* Status Messages */}
                    {resendState.success && (
                        <div className="mt-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                            {resendState.success}
                        </div>
                    )}
                    {resendState.error && (
                        <div className="mt-2 text-sm text-red-700 bg-red-50 p-2 rounded">
                            {resendState.error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={handleManualCheck}
                            disabled={isPolling}
                        >
                            {isPolling ? 'Checking...' : 'I\'ve verified'}
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={handleResendEmail}
                            disabled={!canResend}
                        >
                            {resendState.isLoading ? 'Sending...' : 'Resend email'}
                        </Button>

                        {onChangeEmail && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowChangeEmail(!showChangeEmail)}
                            >
                                Change email
                            </Button>
                        )}

                        {allowDismiss && onDismiss && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onDismiss}
                            >
                                Dismiss
                            </Button>
                        )}
                    </div>

                    {/* Rate limit message */}
                    {timeUntilNextResend > 0 && (
                        <p className="mt-2 text-xs text-blue-600">
                            Next resend available in {timeUntilNextResend} seconds
                        </p>
                    )}

                    {/* Change Email Form */}
                    {showChangeEmail && (
                        <div className="mt-3 p-3 bg-white border border-blue-200 rounded">
                            <div className="flex gap-2">
                                <Input
                                    type="email"
                                    placeholder="newemail@example.com"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="sm"
                                    onClick={handleChangeEmail}
                                    disabled={!newEmail.trim()}
                                >
                                    Update
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowChangeEmail(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


