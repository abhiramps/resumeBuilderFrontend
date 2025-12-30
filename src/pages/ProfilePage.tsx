/**
 * Profile Page
 * User profile management
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import { useReplayTutorial } from '../components/Tutorial';

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { replayTutorial } = useReplayTutorial();

    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (field: keyof typeof formData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: e.target.value,
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // TODO: Implement profile update API call
            // await userService.updateProfile(formData);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setIsEditing(false);
        } catch (err) {
            console.error('Failed to update profile:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        try {
            // TODO: Implement account deletion API call
            // await userService.deleteAccount();

            await logout();
            navigate('/login');
        } catch (err) {
            console.error('Failed to delete account:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                    {/* Profile Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={handleChange('fullName')}
                                    disabled={!isEditing}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange('email')}
                                    disabled={!isEditing}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex gap-3">
                            {!isEditing ? (
                                <Button variant="primary" onClick={() => setIsEditing(true)}>
                                    Edit Profile
                                </Button>
                            ) : (
                                <>
                                    <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({
                                                fullName: user?.fullName || '',
                                                email: user?.email || '',
                                            });
                                        }}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200" />

                    {/* Tutorial Section */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tutorial</h2>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Start Tutorial</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Replay the interactive tutorial to learn how to use the resume builder.
                            </p>
                            <Button
                                variant="secondary"
                                onClick={replayTutorial}
                                leftIcon={<PlayCircle className="w-4 h-4" />}
                            >
                                Replay Tutorial
                            </Button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200" />

                    {/* Danger Zone */}
                    <div>
                        <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
                        <div className="border border-red-200 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Delete Account</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Once you delete your account, there is no going back. All your resumes and data will be permanently deleted.
                            </p>
                            <Button variant="danger" onClick={handleDeleteAccount}>
                                Delete Account
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
