/**
 * Dashboard Page
 * Main dashboard with resume list, search, and management
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResumeBackend } from '../contexts/ResumeBackendContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { ImportExportModal } from '../components/UI/ImportExportModal';
import { SkeletonCardGrid } from '../components/UI/SkeletonCard';
import { Plus, Search, FileText, Copy, Trash2, Share2, MoreVertical, Download, Upload, CheckSquare } from 'lucide-react';
import type { ResumeResponse } from '../types/api.types';

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const {
        resumes,
        isLoading,
        error,
        listResumes,
        createResume,
        deleteResume,
        duplicateResume,
    } = useResumeBackend();

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [showImportExportModal, setShowImportExportModal] = useState(false);
    const [selectedResume, setSelectedResume] = useState<ResumeResponse | null>(null);
    const [bulkSelectMode, setBulkSelectMode] = useState(false);
    const [selectedResumes, setSelectedResumes] = useState<Set<string>>(new Set());

    // Load resumes on mount - only once
    useEffect(() => {
        const loadResumes = async () => {
            try {
                await listResumes({ search: searchQuery || undefined });
            } catch (err) {
                console.error('Failed to load resumes:', err);
            }
        };

        loadResumes();
    }, []); // Empty dependency array - only run once on mount

    const loadResumes = async () => {
        try {
            await listResumes({ search: searchQuery || undefined });
        } catch (err) {
            console.error('Failed to load resumes:', err);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loadResumes();
    };

    const handleCreateResume = async () => {
        try {
            const newResume = await createResume({
                title: 'Untitled Resume',
                templateId: 'professional',
                content: {},
            });
            navigate(`/editor/${newResume.id}`);
        } catch (err) {
            console.error('Failed to create resume:', err);
        }
    };

    const handleEditResume = (id: string) => {
        navigate(`/editor/${id}`);
    };

    const handleDuplicateResume = async (id: string) => {
        try {
            await duplicateResume(id);
            setActiveMenu(null);
        } catch (err) {
            console.error('Failed to duplicate resume:', err);
        }
    };

    const handleDeleteResume = async (id: string) => {
        if (!confirm('Are you sure you want to delete this resume?')) return;

        try {
            await deleteResume(id);
            setActiveMenu(null);
        } catch (err) {
            console.error('Failed to delete resume:', err);
        }
    };

    const handleShareResume = (id: string) => {
        navigate(`/share/${id}`);
        setActiveMenu(null);
    };

    const handleExportResume = (resume: ResumeResponse) => {
        setSelectedResume(resume);
        setShowImportExportModal(true);
        setActiveMenu(null);
    };

    const handleImportResume = () => {
        setSelectedResume(null);
        setShowImportExportModal(true);
    };

    const handleBulkExport = () => {
        if (selectedResumes.size === 0) return;
        setShowImportExportModal(true);
    };

    const handleToggleSelect = (resumeId: string) => {
        const newSelected = new Set(selectedResumes);
        if (newSelected.has(resumeId)) {
            newSelected.delete(resumeId);
        } else {
            newSelected.add(resumeId);
        }
        setSelectedResumes(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedResumes.size === filteredResumes.length) {
            setSelectedResumes(new Set());
        } else {
            setSelectedResumes(new Set(filteredResumes.map(r => r.id)));
        }
    };

    const handleImportSuccess = (_resume: ResumeResponse) => {
        loadResumes();
        setShowImportExportModal(false);
    };

    const filteredResumes = resumes.filter((resume) =>
        resume.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
                            <p className="text-sm text-gray-600">Welcome back, {user?.fullName || user?.email}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="secondary" onClick={() => navigate('/profile')}>
                                Profile
                            </Button>
                            <Button variant="secondary" onClick={logout}>
                                Sign out
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    {/* Search */}
                    <form onSubmit={handleSearchSubmit} className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Search resumes..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="pl-10"
                            />
                        </div>
                    </form>

                    {/* View Toggle */}
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                            onClick={() => setViewMode('grid')}
                        >
                            Grid
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'primary' : 'secondary'}
                            onClick={() => setViewMode('list')}
                        >
                            List
                        </Button>
                    </div>

                    {/* Bulk Select Toggle */}
                    {filteredResumes.length > 0 && (
                        <Button
                            variant={bulkSelectMode ? 'primary' : 'secondary'}
                            onClick={() => {
                                setBulkSelectMode(!bulkSelectMode);
                                setSelectedResumes(new Set());
                            }}
                        >
                            <CheckSquare className="w-5 h-5 mr-2" />
                            Select
                        </Button>
                    )}

                    {/* Import Button */}
                    <Button 
                        variant="secondary" 
                        onClick={handleImportResume} 
                        className="whitespace-nowrap"
                        leftIcon={<Upload className="w-5 h-5" />}
                    >
                        <span className="hidden sm:inline">Import</span>
                    </Button>

                    {/* Create Button */}
                    <Button 
                        variant="primary" 
                        onClick={handleCreateResume} 
                        className="whitespace-nowrap"
                        leftIcon={<Plus className="w-5 h-5" />}
                    >
                        <span className="hidden sm:inline">New Resume</span>
                    </Button>
                </div>

                {/* Bulk Actions Bar */}
                {bulkSelectMode && (
                    <div className="flex items-center justify-between p-4 mb-6 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-4">
                            <Button variant="secondary" size="sm" onClick={handleSelectAll}>
                                {selectedResumes.size === filteredResumes.length ? 'Deselect All' : 'Select All'}
                            </Button>
                            <span className="text-sm text-gray-700">
                                {selectedResumes.size} of {filteredResumes.length} selected
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleBulkExport}
                                disabled={selectedResumes.size === 0}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export Selected
                            </Button>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {/* Loading State with Skeleton */}
                {isLoading && (
                    <SkeletonCardGrid count={6} />
                )}

                {/* Empty State */}
                {!isLoading && filteredResumes.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No resumes</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchQuery ? 'No resumes match your search.' : 'Get started by creating a new resume.'}
                        </p>
                        {!searchQuery && (
                            <div className="mt-6">
                                <Button 
                                    variant="primary" 
                                    onClick={handleCreateResume}
                                    leftIcon={<Plus className="w-5 h-5" />}
                                >
                                    <span>Create your first resume</span>
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Resume Grid */}
                {!isLoading && filteredResumes.length > 0 && viewMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResumes.map((resume) => (
                            <ResumeCard
                                key={resume.id}
                                resume={resume}
                                onEdit={handleEditResume}
                                onDuplicate={handleDuplicateResume}
                                onDelete={handleDeleteResume}
                                onShare={handleShareResume}
                                onExport={handleExportResume}
                                activeMenu={activeMenu}
                                setActiveMenu={setActiveMenu}
                                bulkSelectMode={bulkSelectMode}
                                isSelected={selectedResumes.has(resume.id)}
                                onToggleSelect={handleToggleSelect}
                            />
                        ))}
                    </div>
                )}

                {/* Resume List */}
                {!isLoading && filteredResumes.length > 0 && viewMode === 'list' && (
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {filteredResumes.map((resume) => (
                                <ResumeListItem
                                    key={resume.id}
                                    resume={resume}
                                    onEdit={handleEditResume}
                                    onDuplicate={handleDuplicateResume}
                                    onDelete={handleDeleteResume}
                                    onShare={handleShareResume}
                                    onExport={handleExportResume}
                                    bulkSelectMode={bulkSelectMode}
                                    isSelected={selectedResumes.has(resume.id)}
                                    onToggleSelect={handleToggleSelect}
                                />
                            ))}
                        </ul>
                    </div>
                )}
            </main>

            {/* Import/Export Modal */}
            <ImportExportModal
                isOpen={showImportExportModal}
                onClose={() => {
                    setShowImportExportModal(false);
                    setSelectedResume(null);
                }}
                resume={selectedResume || undefined}
                resumes={selectedResumes.size > 0 ? filteredResumes.filter(r => selectedResumes.has(r.id)) : []}
                mode={selectedResumes.size > 0 ? 'bulk' : 'single'}
                onImportSuccess={handleImportSuccess}
            />
        </div>
    );
};

// Resume Card Component
interface ResumeCardProps {
    resume: ResumeResponse;
    onEdit: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
    onShare: (id: string) => void;
    onExport: (resume: ResumeResponse) => void;
    activeMenu: string | null;
    setActiveMenu: (id: string | null) => void;
    bulkSelectMode: boolean;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
}

const ResumeCard: React.FC<ResumeCardProps> = ({
    resume,
    onEdit,
    onDuplicate,
    onDelete,
    onShare,
    onExport,
    activeMenu,
    setActiveMenu,
    bulkSelectMode,
    isSelected,
    onToggleSelect,
}) => {
    return (
        <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 relative ${bulkSelectMode && isSelected ? 'ring-2 ring-blue-600' : ''
            }`}>
            {/* Checkbox for bulk select */}
            {bulkSelectMode && (
                <div className="absolute top-4 left-4 z-10">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(resume.id)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                </div>
            )}

            {/* Menu Button */}
            {!bulkSelectMode && (
                <button
                    onClick={() => setActiveMenu(activeMenu === resume.id ? null : resume.id)}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-md"
                >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
            )}

            {/* Dropdown Menu */}
            {activeMenu === resume.id && !bulkSelectMode && (
                <div className="absolute top-12 right-4 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10 min-w-[160px]">
                    <button
                        onClick={() => onExport(resume)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={() => onShare(resume.id)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                        <Share2 className="w-4 h-4" />
                        Share
                    </button>
                    <button
                        onClick={() => onDuplicate(resume.id)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                        <Copy className="w-4 h-4" />
                        Duplicate
                    </button>
                    <button
                        onClick={() => onDelete(resume.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            )}

            {/* Content */}
            <div
                onClick={() => !bulkSelectMode && onEdit(resume.id)}
                className={bulkSelectMode ? '' : 'cursor-pointer'}
            >
                <div className={`flex items-center gap-3 mb-4 ${bulkSelectMode ? 'ml-8' : ''}`}>
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{resume.title}</h3>
                        <p className="text-sm text-gray-500">
                            Updated {new Date(resume.updatedAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Resume List Item Component
interface ResumeListItemProps {
    resume: ResumeResponse;
    onEdit: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
    onShare: (id: string) => void;
    onExport: (resume: ResumeResponse) => void;
    bulkSelectMode: boolean;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
}

const ResumeListItem: React.FC<ResumeListItemProps> = ({
    resume,
    onEdit,
    onDuplicate,
    onDelete,
    onShare,
    onExport,
    bulkSelectMode,
    isSelected,
    onToggleSelect,
}) => {
    return (
        <li className={`px-6 py-4 hover:bg-gray-50 ${bulkSelectMode && isSelected ? 'bg-blue-50' : ''
            }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    {bulkSelectMode && (
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleSelect(resume.id)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                    )}
                    <div
                        className={`flex items-center gap-4 flex-1 min-w-0 ${bulkSelectMode ? '' : 'cursor-pointer'}`}
                        onClick={() => !bulkSelectMode && onEdit(resume.id)}
                    >
                        <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-medium text-gray-900 truncate">{resume.title}</h3>
                            <p className="text-sm text-gray-500">
                                Updated {new Date(resume.updatedAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
                {!bulkSelectMode && (
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={() => onExport(resume)}>
                            <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => onShare(resume.id)}>
                            <Share2 className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => onDuplicate(resume.id)}>
                            <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => onDelete(resume.id)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                    </div>
                )}
            </div>
        </li>
    );
};
