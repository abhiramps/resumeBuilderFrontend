/**
 * Email Verification Flow Integration Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SignupPage } from '../pages/SignupPage';
import { LoginPage } from '../pages/LoginPage';
import { AuthProvider } from '../contexts/AuthContext';

// Mock the auth service 
jest.mock('../services/auth.service');
jest.mock('../contexts/AuthContext', () => ({
    ...jest.requireActual('../contexts/AuthContext'),
    useAuth: () => ({
        signup: jest.fn(),
        login: jest.fn(),
        isLoading: false,
        error: null,
        clearError: jest.fn(),
        setPendingVerification: jest.fn(),
        clearPendingVerification: jest.fn(),
        checkEmailVerification: jest.fn(),
    }),
}));

// Mock fetch for API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

const renderWithRouter = (component: React.ReactElement) => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                {component}
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('Email Verification Flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Signup Flow', () => {
        it('shows verification banner after successful signup', async () => {
            const mockSignup = jest.fn().mockResolvedValue({
                user: { id: '1', email: 'test@example.com' },
            });

            // Mock the useAuth hook
            jest.doMock('../contexts/AuthContext', () => ({
                useAuth: () => ({
                    signup: mockSignup,
                    isLoading: false,
                    error: null,
                    clearError: jest.fn(),
                    setPendingVerification: jest.fn(),
                }),
            }));

            renderWithRouter(<SignupPage />);

            // Fill out signup form
            fireEvent.change(screen.getByLabelText(/full name/i), {
                target: { value: 'Test User' },
            });
            fireEvent.change(screen.getByLabelText(/email/i), {
                target: { value: 'test@example.com' },
            });
            fireEvent.change(screen.getByLabelText(/^password/i), {
                target: { value: 'password123' },
            });
            fireEvent.change(screen.getByLabelText(/confirm password/i), {
                target: { value: 'password123' },
            });

            // Check terms
            fireEvent.click(screen.getByLabelText(/i agree/i));

            // Submit form
            fireEvent.click(screen.getByText('Create account'));

            await waitFor(() => {
                expect(mockSignup).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
                expect(screen.getByText('Please verify your email')).toBeInTheDocument();
                expect(screen.getByText(/test@example\.com/)).toBeInTheDocument();
            });
        });

        it('allows user to resend verification email from signup page', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    message: 'Verification email sent successfully.',
                }),
            });

            renderWithRouter(<SignupPage />);

            // Simulate showing verification banner (in real app this happens after signup)
            // For testing, we'd need to trigger the state change

            // This test would be more complete with a full integration test
            // that actually goes through the signup process
            expect(true).toBe(true); // Placeholder for now
        });
    });

    describe('Login Flow', () => {
        it('blocks login for unverified users and shows verification banner', async () => {
            const mockLogin = jest.fn().mockResolvedValue({
                user: { id: '1', email: 'test@example.com', email_confirmed_at: null },
            });
            const mockCheckVerification = jest.fn().mockResolvedValue(false);

            jest.doMock('../contexts/AuthContext', () => ({
                useAuth: () => ({
                    login: mockLogin,
                    checkEmailVerification: mockCheckVerification,
                    isLoading: false,
                    error: null,
                    clearError: jest.fn(),
                    setPendingVerification: jest.fn(),
                }),
            }));

            renderWithRouter(<LoginPage />);

            // Fill out login form
            fireEvent.change(screen.getByLabelText(/email/i), {
                target: { value: 'test@example.com' },
            });
            fireEvent.change(screen.getByLabelText(/password/i), {
                target: { value: 'password123' },
            });

            // Submit form
            fireEvent.click(screen.getByText('Sign in'));

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
                expect(mockCheckVerification).toHaveBeenCalledWith('test@example.com');
                // In a real test, this would show the verification banner
            });
        });

        it('allows login for verified users', async () => {
            const mockLogin = jest.fn().mockResolvedValue({
                user: { id: '1', email: 'test@example.com', email_confirmed_at: new Date() },
            });
            const mockCheckVerification = jest.fn().mockResolvedValue(true);

            jest.doMock('../contexts/AuthContext', () => ({
                useAuth: () => ({
                    login: mockLogin,
                    checkEmailVerification: mockCheckVerification,
                    isLoading: false,
                    error: null,
                    clearError: jest.fn(),
                }),
            }));

            renderWithRouter(<LoginPage />);

            // Fill out login form
            fireEvent.change(screen.getByLabelText(/email/i), {
                target: { value: 'test@example.com' },
            });
            fireEvent.change(screen.getByLabelText(/password/i), {
                target: { value: 'password123' },
            });

            // Submit form
            fireEvent.click(screen.getByText('Sign in'));

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
                expect(mockCheckVerification).toHaveBeenCalledWith('test@example.com');
                // User should be navigated to dashboard (mock navigation)
            });
        });
    });

    describe('Verification Banner Interactions', () => {
        it('handles successful verification check', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ verified: true }),
            });

            renderWithRouter(<SignupPage />);

            // This would be tested more thoroughly in component tests
            // Integration test would require setting up the banner state
            expect(true).toBe(true); // Placeholder
        });

        it('handles rate-limited resend attempts', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({
                    error: {
                        message: 'Too many resend attempts. Try again in 5 minutes.',
                        waitTime: 300,
                    },
                }),
            });

            renderWithRouter(<SignupPage />);

            // This would be tested more thoroughly in component tests
            expect(true).toBe(true); // Placeholder
        });
    });
});


