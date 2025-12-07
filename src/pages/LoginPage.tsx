/**
 * Login Page
 * User authentication page with email/password and OAuth options
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { EmailVerificationBanner } from '../components/UI/EmailVerificationBanner';
import { SEO } from '../components/common/SEO';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, isLoading, error, clearError, checkEmailVerification, setPendingVerification, clearPendingVerification } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showVerificationBanner, setShowVerificationBanner] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState<string>('');

    const handleChange = (field: keyof typeof formData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: e.target.value,
        }));
        // Clear validation error for this field
        if (validationErrors[field]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
        clearError();
    };

    // Handle verification completion
    const handleVerificationComplete = () => {
        clearPendingVerification();
        setShowVerificationBanner(false);
        setUnverifiedEmail('');
        navigate('/dashboard');
    };

    // Handle change email - redirect to signup
    const handleChangeEmail = () => {
        clearPendingVerification();
        setShowVerificationBanner(false);
        setUnverifiedEmail('');
        navigate('/signup');
    };

    // Handle banner dismiss - allow retry
    const handleDismissBanner = () => {
        clearPendingVerification();
        setShowVerificationBanner(false);
        setUnverifiedEmail('');
    };

    const validate = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            await login(formData.email, formData.password);

            // After successful login, check if email is verified
            const isVerified = await checkEmailVerification(formData.email);

            if (!isVerified) {
                // Block access and show verification banner
                setUnverifiedEmail(formData.email);
                setPendingVerification(formData.email);
                setShowVerificationBanner(true);
                // Don't navigate to dashboard
                return;
            }

            navigate('/dashboard');
        } catch (err) {
            // Check if this is an unverified email error
            if (err instanceof Error && err.message.includes('Email not confirmed')) {
                setUnverifiedEmail(formData.email);
                setPendingVerification(formData.email);
                setShowVerificationBanner(true);
                return;
            }
            // Other errors are handled by AuthContext
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <SEO 
                title="Login" 
                description="Sign in to your account to continue building your free resume."
            />
            <div className="max-w-md w-full space-y-6 sm:space-y-8">
                {/* Header */}
                <div>
                    <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 px-4">
                        Or{' '}
                        <Link
                            to="/signup"
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            create a new account
                        </Link>
                    </p>
                </div>

                {/* Verification Banner for Unverified Users */}
                {showVerificationBanner && unverifiedEmail && (
                    <EmailVerificationBanner
                        email={unverifiedEmail}
                        onVerificationComplete={handleVerificationComplete}
                        onChangeEmail={handleChangeEmail}
                        onDismiss={handleDismissBanner}
                        allowDismiss={true}
                        className="mb-6"
                    />
                )}

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {/* Error Message */}
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange('email')}
                                placeholder="you@example.com"
                                className="mt-1"
                                disabled={isLoading}
                            />
                            {validationErrors.email && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange('password')}
                                placeholder="••••••••"
                                className="mt-1"
                                disabled={isLoading}
                            />
                            {validationErrors.password && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                            )}
                        </div>
                    </div>

                    {/* Remember & Forgot */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link
                                to="/forgot-password"
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </Button>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    {/* OAuth Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full opacity-60 cursor-not-allowed text-sm"
                            disabled={true}
                            onClick={() => {
                                // OAuth implementation will be added
                                console.log('Google OAuth');
                            }}
                            title="OAuth login coming soon"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span className="hidden sm:inline">Google</span>
                            <span className="sm:hidden">G</span>
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full opacity-60 cursor-not-allowed text-sm"
                            disabled={true}
                            onClick={() => {
                                // OAuth implementation will be added
                                console.log('GitHub OAuth');
                            }}
                            title="OAuth login coming soon"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            <span className="hidden sm:inline">GitHub</span>
                            <span className="sm:hidden">GH</span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
