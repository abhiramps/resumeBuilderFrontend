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
import { defaultSections } from '../constants/defaultResume';
import type { ResumeResponse, ResumeContent } from '../types/api.types';
import { TemplateThumbnail } from '../components/Templates/TemplateThumbnail';
import { TemplateType } from '../types/resume.types';
import { Sector } from '../types/sector.types';

// Mock SECTORS if not exported (check sector.types.ts content again if needed)
// Based on previous edits, we defined the Sector type but maybe not a list constant. 
// We should define a helper list or add it to types.
const AVAILABLE_SECTORS: { id: Sector; label: string }[] = [
    { id: 'general', label: 'General / Other' },
    { id: 'it', label: 'Information Technology (IT)' },
    { id: 'finance', label: 'Finance & Banking' },
    { id: 'medical', label: 'Medical & Healthcare' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'sales', label: 'Sales' },
    { id: 'legal', label: 'Legal' },
];

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

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newResumeTitle, setNewResumeTitle] = useState('');
    const [selectedSector, setSelectedSector] = useState<Sector>('general');
    const [isCreating, setIsCreating] = useState(false);

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

    const handleCreateResumeClick = () => {
        setNewResumeTitle('');
        setSelectedSector('general');
        setShowCreateModal(true);
    };

    const handleConfirmCreate = async () => {
        if (!newResumeTitle.trim()) return;
        
        setIsCreating(true);
        try {
            // Construct initial content
            const initialContent: ResumeContent = {};

            // Prefill personal info
            initialContent.personalInfo = {
                fullName: 'John Doe',
                email: 'john.doe@example.com',
                phone: '(555) 123-4567',
                location: 'New York, USA',
                linkedin: 'https://linkedin.com/in/johndoe',
                github: 'https://github.com/johndoe',
                website: 'https://johndoe.com',
            } as any;

            // Map default sections
            defaultSections.forEach(section => {
                 if (section.type === 'summary' && 'summary' in section.content) {
                    initialContent.summary = section.content.summary;
                } else if (section.type === 'experience' && 'experiences' in section.content) {
                    initialContent.experience = section.content.experiences;
                } else if (section.type === 'education' && 'education' in section.content) {
                    initialContent.education = section.content.education;
                } else if (section.type === 'skills' && 'skills' in section.content) {
                    initialContent.skills = section.content.skills;
                } else if (section.type === 'projects' && 'projects' in section.content) {
                    initialContent.projects = section.content.projects;
                } else if (section.type === 'certifications' && 'certifications' in section.content) {
                    initialContent.certifications = section.content.certifications;
                } else if (section.type === 'additional-info' && 'additionalInfo' in section.content) {
                    initialContent.additionalInfo = section.content.additionalInfo;
                }
            });

            const newResume = await createResume({
                title: newResumeTitle,
                templateId: 'professional',
                sector: selectedSector,
                content: initialContent,
            });
            setShowCreateModal(false);
            navigate(`/editor/${newResume.id}`);
        } catch (err) {
            console.error('Failed to create resume:', err);
        } finally {
            setIsCreating(false);
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Resumes</h1>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">Welcome back, {user?.fullName || user?.email}</p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                            <Button variant="secondary" onClick={() => navigate('/profile')} className="flex-1 sm:flex-initial text-sm">
                                <span className="hidden sm:inline">Profile</span>
                                <span className="sm:hidden">Profile</span>
                            </Button>
                            <Button variant="secondary" onClick={logout} className="flex-1 sm:flex-initial text-sm">
                                <span className="hidden sm:inline">Sign out</span>
                                <span className="sm:hidden">Sign out</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Actions Bar */}
                <div className="flex flex-col gap-3 sm:gap-4 mb-6">
                    {/* Top Row: Search and Primary Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {/* Search */}
                        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                <Input
                                    type="text"
                                    placeholder="Search resumes..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="pl-9 sm:pl-10 text-sm"
                                />
                            </div>
                        </form>

                        {/* Create Button - Always visible */}
                        <Button variant="primary" onClick={handleCreateResumeClick} className="w-full sm:w-auto whitespace-nowrap">
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                            <span className="hidden sm:inline">New Resume</span>
                            <span className="sm:hidden">New</span>
                        </Button>
                    </div>

                    {/* Bottom Row: Secondary Actions */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {/* View Toggle */}
                        <div className="flex gap-2 border border-gray-200 rounded-lg p-1">
                            <Button
                                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                                onClick={() => setViewMode('grid')}
                                className="px-3 py-1.5 text-xs sm:text-sm"
                            >
                                <span className="hidden sm:inline">Grid</span>
                                <span className="sm:hidden">G</span>
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                                onClick={() => setViewMode('list')}
                                className="px-3 py-1.5 text-xs sm:text-sm"
                            >
                                <span className="hidden sm:inline">List</span>
                                <span className="sm:hidden">L</span>
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
                                className="text-xs sm:text-sm"
                            >
                                <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                                <span className="hidden sm:inline">Select</span>
                            </Button>
                        )}

                        {/* Import Button */}
                        <Button variant="secondary" onClick={handleImportResume} className="text-xs sm:text-sm">
                            <Upload className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                            <span className="hidden sm:inline">Import</span>
                        </Button>
                    </div>
                </div>

                {/* Bulk Actions Bar */}
                {bulkSelectMode && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-4 mb-6 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                            <Button variant="secondary" size="sm" onClick={handleSelectAll} className="text-xs sm:text-sm">
                                {selectedResumes.size === filteredResumes.length ? 'Deselect All' : 'Select All'}
                            </Button>
                            <span className="text-xs sm:text-sm text-gray-700">
                                {selectedResumes.size} of {filteredResumes.length} selected
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleBulkExport}
                                disabled={selectedResumes.size === 0}
                                className="text-xs sm:text-sm w-full sm:w-auto"
                            >
                                <Download className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Export Selected</span>
                                <span className="sm:hidden">Export</span>
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
                                    onClick={handleCreateResumeClick}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                    <div className="bg-white/80 backdrop-blur-md shadow-sm rounded-xl border border-white/50 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
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

            {/* Create Resume Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Resume</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Resume Title</label>
                                <Input
                                    value={newResumeTitle}
                                    onChange={(e) => setNewResumeTitle(e.target.value)}
                                    placeholder="e.g., Software Engineer Resume"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Sector</label>
                                <p className="text-xs text-gray-500 mb-2">Select the industry to get tailored templates and suggestions.</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {AVAILABLE_SECTORS.map((sector) => (
                                        <label
                                            key={sector.id}
                                            className={`
                                                flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                                                ${selectedSector === sector.id 
                                                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                                            `}
                                        >
                                            <span className="text-sm font-medium text-gray-900">{sector.label}</span>
                                            <input
                                                type="radio"
                                                name="sector"
                                                value={sector.id}
                                                checked={selectedSector === sector.id}
                                                onChange={(e) => setSelectedSector(e.target.value as Sector)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={handleConfirmCreate}
                                disabled={!newResumeTitle.trim() || isCreating}
                                loading={isCreating}
                            >
                                Create Resume
                            </Button>
                        </div>
                    </div>
                </div>
            )}
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
    // Helper to safely get template type
    const getTemplateType = (id: string): TemplateType => {
        const validTypes: TemplateType[] = ['classic', 'modern', 'minimal', 'professional', 'academic'];
        return validTypes.includes(id as TemplateType) ? (id as TemplateType) : 'professional';
    };

    return (
        <div className={`
            group relative flex flex-col
            bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60
            rounded-2xl border border-white/50 shadow-sm
            hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200/50 hover:bg-white/80
            transition-all duration-300 ease-out
            ${bulkSelectMode && isSelected ? 'ring-2 ring-blue-500 shadow-blue-500/20 bg-blue-50/50' : ''}
        `}>
            {/* Checkbox for bulk select */}
            {bulkSelectMode && (
                <div className="absolute top-3 left-3 z-20">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(resume.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 bg-white/80 border-gray-300 shadow-sm cursor-pointer"
                    />
                </div>
            )}

            {/* Menu Button */}
            {!bulkSelectMode && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === resume.id ? null : resume.id)
                    }}
                    className={`
                        absolute top-3 right-3 p-1.5 rounded-full z-10 transition-all duration-200
                        ${activeMenu === resume.id
                            ? 'bg-white shadow-md text-gray-900 opacity-100 scale-100'
                            : 'bg-white/80 text-gray-600 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 hover:bg-white hover:text-blue-600 shadow-sm backdrop-blur-sm'
                        }
                    `}
                >
                    <MoreVertical className="w-4 h-4" />
                </button>
            )}

            {/* Dropdown Menu */}
            {activeMenu === resume.id && !bulkSelectMode && (
                <div className="absolute top-10 right-3 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/50 py-1.5 z-30 min-w-[160px] animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                    <button
                        onClick={(e) => { e.stopPropagation(); onExport(resume); }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onShare(resume.id); }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors"
                    >
                        <Share2 className="w-3.5 h-3.5" />
                        Share
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDuplicate(resume.id); }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors"
                    >
                        <Copy className="w-3.5 h-3.5" />
                        Duplicate
                    </button>
                    <div className="h-px bg-gray-100/50 my-1" />
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(resume.id); }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                    </button>
                </div>
            )}

            {/* Preview Section - Reduced Height / Smaller aspect */}
            <div
                onClick={() => !bulkSelectMode && onEdit(resume.id)}
                className={`
                    relative w-full aspect-[1/1.3] overflow-hidden rounded-t-2xl
                    ${bulkSelectMode ? '' : 'cursor-pointer'}
                `}
            >
                {/* Background base for thumbnail */}
                <div className="absolute inset-0 bg-gray-100/50 transition-colors group-hover:bg-gray-100/30"></div>
                
                {/* Thumbnail Wrapper with nicer padding/positioning */}
                <div className="absolute inset-4 sm:inset-5 shadow-lg rounded-sm overflow-hidden bg-white transform transition-transform duration-500 will-change-transform group-hover:scale-[1.03] group-hover:-translate-y-1">
                    <TemplateThumbnail
                        templateType={getTemplateType(resume.templateId)}
                        className="w-full h-full object-cover"
                    />
                     {/* Inner glass sheen over the resume preview */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>

                {/* Bottom fading gradient for smooth transition to footer */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />
            </div>

            {/* Content Section - Compact Footer */}
            <div
                onClick={() => !bulkSelectMode && onEdit(resume.id)}
                className={`
                    px-4 pb-4 pt-2 flex flex-col gap-1
                    ${bulkSelectMode ? '' : 'cursor-pointer'}
                `}
            >
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-800 truncate leading-tight group-hover:text-blue-600 transition-colors" title={resume.title}>
                        {resume.title}
                    </h3>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                     <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400 bg-gray-100/80 px-1.5 py-0.5 rounded-md border border-gray-100/50">
                        {getTemplateType(resume.templateId)}
                    </span>
                    <span className="text-[10px] text-gray-400 tabular-nums">
                        {new Date(resume.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
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
