import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button, Input, Select } from "../UI";
import { useResumeContext } from "../../contexts/ResumeContext";
import { useResumeBackend } from "../../contexts/ResumeBackendContext";
import { Certification, Resume } from "../../types/resume.types";

export interface CertificationsEditorProps {
    className?: string;
}

export interface CertificationEntryProps {
    certification: Certification;
    isEditing: boolean;
    onUpdate: (id: string, updates: Partial<Certification>) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onToggleEdit: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
}

// Helper to convert frontend Resume state to backend ResumeContent
const mapResumeToContent = (resume: Resume): any => {
    const content: any = {
        personalInfo: resume.personalInfo,
        sectionOrder: resume.sections.map(s => ({
            id: s.id,
            type: s.type,
            title: s.title,
            enabled: s.enabled,
            order: s.order
        }))
    };

    resume.sections.forEach(section => {
        // Map content regardless of enabled status to ensure data persistence
        const sectionContent = section.content as any;
        switch (section.type) {
            case 'summary':
                content.summary = sectionContent.summary;
                break;
            case 'experience':
                content.experience = sectionContent.experiences;
                break;
            case 'education':
                content.education = sectionContent.education;
                break;
            case 'skills':
                content.skills = sectionContent.skills;
                break;
            case 'projects':
                content.projects = sectionContent.projects;
                break;
            case 'certifications':
                content.certifications = sectionContent.certifications;
                break;
            case 'custom':
                if (!content.customSections) content.customSections = [];
                content.customSections.push({
                    id: sectionContent.custom.id,
                    title: sectionContent.custom.title,
                    content: sectionContent.custom.content,
                    order: section.order
                });
                break;
        }
    });
    return content;
};

const MONTH_OPTIONS = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
];

const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear + 10; year >= 1990; year--) {
        years.push({ value: year.toString(), label: year.toString() });
    }
    return years;
};

const YEAR_OPTIONS = generateYearOptions();

const CERTIFICATION_SUGGESTIONS = [
    "AWS Certified Solutions Architect",
    "Google Cloud Professional",
    "Microsoft Azure Administrator",
    "Certified Kubernetes Administrator (CKA)",
    "Certified Information Systems Security Professional (CISSP)",
    "CompTIA Security+",
    "Oracle Certified Professional",
    "Certified ScrumMaster (CSM)",
];

const CertificationEntry: React.FC<CertificationEntryProps> = ({
    certification,
    isEditing,
    onUpdate,
    onDelete,
    onDuplicate,
    onToggleEdit,
    onMoveUp,
    onMoveDown,
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Local state for immediate UI updates
    const [localCertification, setLocalCertification] = useState(certification);
    const [doesNotExpire, setDoesNotExpire] = useState(!certification.expiryDate);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Track date selections separately for better UX
    const [issueMonth, setIssueMonth] = useState<string | undefined>(undefined);
    const [issueYear, setIssueYear] = useState<string | undefined>(undefined);
    const [expiryMonth, setExpiryMonth] = useState<string | undefined>(undefined);
    const [expiryYear, setExpiryYear] = useState<string | undefined>(undefined);

    // Update local state when prop changes (e.g., when switching entries)
    useEffect(() => {
        setLocalCertification(certification);
        setDoesNotExpire(!certification.expiryDate);
        // Parse and set date selections
        const [iYear, iMonth] = certification.issueDate ? certification.issueDate.split("-") : [undefined, undefined];
        const [eYear, eMonth] = certification.expiryDate ? certification.expiryDate.split("-") : [undefined, undefined];
        setIssueMonth(iMonth);
        setIssueYear(iYear);
        setExpiryMonth(eMonth);
        setExpiryYear(eYear);
    }, [certification.id]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const handleFieldUpdate = (field: keyof Certification, value: any) => {
        // Update local state immediately for instant UI feedback
        const updatedCertification = { ...localCertification, [field]: value };
        setLocalCertification(updatedCertification);

        // Debounce the parent update
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            onUpdate(certification.id, { [field]: value });
        }, 300);
    };

    const handleDateUpdate = (field: "issueDate" | "expiryDate", month: string | undefined, year: string | undefined) => {
        // Update the appropriate state variables
        if (field === "issueDate") {
            if (month !== undefined) setIssueMonth(month);
            if (year !== undefined) setIssueYear(year);

            // Use the new values or keep existing ones
            const finalMonth = month !== undefined ? month : issueMonth;
            const finalYear = year !== undefined ? year : issueYear;

            // Update if we have both parts
            if (finalMonth && finalYear) {
                const dateValue = `${finalYear}-${finalMonth}`;
                handleFieldUpdate(field, dateValue);
            }
        } else {
            if (month !== undefined) setExpiryMonth(month);
            if (year !== undefined) setExpiryYear(year);

            // Use the new values or keep existing ones
            const finalMonth = month !== undefined ? month : expiryMonth;
            const finalYear = year !== undefined ? year : expiryYear;

            // Update if we have both parts
            if (finalMonth && finalYear) {
                const dateValue = `${finalYear}-${finalMonth}`;
                handleFieldUpdate(field, dateValue);
            }
        }
    };

    // Use the separate state variables for display
    const issueDate = { month: issueMonth, year: issueYear };
    const expiryDate = { month: expiryMonth, year: expiryYear };

    const handleDoesNotExpireToggle = (checked: boolean) => {
        setDoesNotExpire(checked);
        if (checked) {
            handleFieldUpdate("expiryDate", "");
        }
    };

    const validateURL = (url: string): boolean => {
        if (!url) return true;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const isExpiringSoon = () => {
        if (!certification.expiryDate) return false;
        const expiry = new Date(certification.expiryDate + "-01");
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
        return expiry <= threeMonthsFromNow && expiry >= new Date();
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-2 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {certification.name || "New Certification"}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                            {certification.issuer && certification.issuer}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    <button type="button" onClick={() => onMoveUp(certification.id)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded" title="Move up">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                    <button type="button" onClick={() => onMoveDown(certification.id)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded" title="Move down">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <button type="button" onClick={() => onToggleEdit(certification.id)} className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded">
                        {isEditing ? "Save" : "Edit"}
                    </button>
                    <button type="button" onClick={() => onDuplicate(certification.id)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded" title="Duplicate entry">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <button type="button" onClick={() => setShowDeleteConfirm(true)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded" title="Delete entry">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Expiring Soon Status Tag */}
            {isExpiringSoon() && (
                <div className="flex">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 text-orange-800 border border-orange-200">
                        ⚠ Expiring Soon
                    </span>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Certification</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to delete this certification? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                            <Button variant="danger" onClick={() => { onDelete(certification.id); setShowDeleteConfirm(false); }}>Delete</Button>
                        </div>
                    </div>
                </div>
            )}

            {isEditing && (
                <div className="space-y-3 border-t border-gray-200 pt-3">
                    <div>
                        <Input label="Certification Name" value={localCertification.name} onChange={(e) => handleFieldUpdate("name", e.target.value)} required placeholder="e.g., AWS Certified Solutions Architect" list="cert-suggestions" className="text-sm" />
                        <datalist id="cert-suggestions">
                            {CERTIFICATION_SUGGESTIONS.map((cert, index) => (
                                <option key={index} value={cert} />
                            ))}
                        </datalist>
                    </div>

                    <Input label="Issuing Organization" value={localCertification.issuer} onChange={(e) => handleFieldUpdate("issuer", e.target.value)} required placeholder="e.g., Amazon Web Services" className="text-sm" />

                    <div className="space-y-2">
                        <h5 className="text-xs font-medium text-gray-700">Issue Date</h5>
                        <div className="grid grid-cols-2 gap-2">
                            <Select label="Month" options={MONTH_OPTIONS} value={issueDate.month} onChange={(value) => handleDateUpdate("issueDate", value, issueDate.year)} placeholder="Month" className="text-sm" />
                            <Select label="Year" options={YEAR_OPTIONS} value={issueDate.year} onChange={(value) => handleDateUpdate("issueDate", issueDate.month, value)} placeholder="Year" className="text-sm" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h5 className="text-xs font-medium text-gray-700">Expiration Date</h5>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={doesNotExpire} onChange={(e) => handleDoesNotExpireToggle(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-xs text-gray-700">Does not expire</span>
                            </label>
                        </div>
                        {!doesNotExpire && (
                            <div className="grid grid-cols-2 gap-2">
                                <Select label="Month" options={MONTH_OPTIONS} value={expiryDate.month} onChange={(value) => handleDateUpdate("expiryDate", value, expiryDate.year)} placeholder="Month" className="text-sm" />
                                <Select label="Year" options={YEAR_OPTIONS} value={expiryDate.year} onChange={(value) => handleDateUpdate("expiryDate", expiryDate.month, value)} placeholder="Year" className="text-sm" />
                            </div>
                        )}
                    </div>

                    <Input label="Credential ID (Optional)" value={localCertification.credentialId || ""} onChange={(e) => handleFieldUpdate("credentialId", e.target.value)} placeholder="e.g., ABC123XYZ" className="text-sm" />

                    <div>
                        <Input label="Credential URL (Optional)" value={localCertification.url || ""} onChange={(e) => handleFieldUpdate("url", e.target.value)} placeholder="https://..." type="url" className="text-sm" />
                        {localCertification.url && !validateURL(localCertification.url) && (
                            <p className="text-xs text-red-600 mt-1">Please enter a valid URL</p>
                        )}
                    </div>
                </div>
            )}

            {!isEditing && (
                <div className="space-y-2 border-t border-gray-200 pt-3">
                    {certification.credentialId && (
                        <p className="text-xs text-gray-600">
                            <span className="font-medium">Credential ID:</span> {certification.credentialId}
                        </p>
                    )}
                    {certification.url && (
                        <a href={certification.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center">
                            View Credential
                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    )}
                    {certification.issueDate && (
                        <p className="text-xs text-gray-500">
                            Issued: {new Date(certification.issueDate + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                            {certification.expiryDate && (
                                <> • Expires: {new Date(certification.expiryDate + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}</>
                            )}
                            {!certification.expiryDate && <> • No Expiration</>}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export const CertificationsEditor: React.FC<CertificationsEditorProps> = ({ className = "" }) => {
    const { resume, dispatch } = useResumeContext();
    const { updateResume } = useResumeBackend();
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

    const certificationsSection = (resume.sections || []).find((section) => section.type === "certifications");
    const certifications = certificationsSection?.content ? (certificationsSection.content as { certifications: Certification[] }).certifications : [];

    const generateId = (): string => Math.random().toString(36).substr(2, 9);

    // Ref to store the debounce timer
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const debouncedUpdate = useCallback(
        (updatedCertifications: Certification[]) => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => {
                if (certificationsSection) {
                    dispatch({
                        type: "UPDATE_SECTION",
                        payload: {
                            id: certificationsSection.id,
                            updates: { content: { certifications: updatedCertifications } },
                        },
                    });
                }
            }, 300);
        },
        [dispatch, certificationsSection]
    );

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    /**
     * Helper to save certifications to backend
     */
    const saveToBackend = (updatedCertifications: Certification[]) => {
        const contentToSave = mapResumeToContent(resume);
        contentToSave.certifications = updatedCertifications;

        updateResume({
            content: contentToSave as any
        });
    };

    const addCertification = () => {
        const newCertification: Certification = {
            id: generateId(),
            name: "",
            issuer: "",
            issueDate: "",
            expiryDate: "",
            credentialId: "",
            url: "",
        };
        const updated = [...certifications, newCertification];
        debouncedUpdate(updated);
        saveToBackend(updated);
        setEditingEntryId(newCertification.id);
    };

    const updateCertification = (id: string, updates: Partial<Certification>) => {
        const updated = certifications.map((cert) => (cert.id === id ? { ...cert, ...updates } : cert));
        debouncedUpdate(updated);
        saveToBackend(updated);
    };

    const deleteCertification = (id: string) => {
        const updated = certifications.filter((cert) => cert.id !== id);
        debouncedUpdate(updated);
        saveToBackend(updated);
        if (editingEntryId === id) setEditingEntryId(null);
    };

    const duplicateCertification = (id: string) => {
        const certToDuplicate = certifications.find((cert) => cert.id === id);
        if (certToDuplicate) {
            const duplicated: Certification = { ...certToDuplicate, id: generateId(), name: `${certToDuplicate.name} (Copy)` };
            const updated = [...certifications, duplicated];
            debouncedUpdate(updated);
            saveToBackend(updated);
            setEditingEntryId(duplicated.id);
        }
    };

    const toggleEditEntry = (id: string) => {
        if (editingEntryId === id) {
             saveToBackend(certifications);
        }
        setEditingEntryId(editingEntryId === id ? null : id);
    };

    const moveCertificationUp = (id: string) => {
        const currentIndex = certifications.findIndex((cert) => cert.id === id);
        if (currentIndex > 0) {
            const updated = [...certifications];
            [updated[currentIndex - 1], updated[currentIndex]] = [updated[currentIndex], updated[currentIndex - 1]];
            debouncedUpdate(updated);
            saveToBackend(updated);
        }
    };

    const moveCertificationDown = (id: string) => {
        const currentIndex = certifications.findIndex((cert) => cert.id === id);
        if (currentIndex < certifications.length - 1) {
            const updated = [...certifications];
            [updated[currentIndex], updated[currentIndex + 1]] = [updated[currentIndex + 1], updated[currentIndex]];
            debouncedUpdate(updated);
            saveToBackend(updated);
        }
    };

    if (!certificationsSection) return null;

    return (
        <div className={className}>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        {certifications.length} {certifications.length === 1 ? "entry" : "entries"}
                    </p>
                    <button
                        onClick={addCertification}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-700 hover:bg-gray-800 rounded-md transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Certification
                    </button>
                </div>

                {/* Certification Entries */}
                {certifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                        <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">No certifications added</h4>
                        <p className="text-xs text-gray-500 mb-3">
                            Add your professional certifications to stand out.
                        </p>
                        <button
                            onClick={addCertification}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-700 hover:bg-gray-800 rounded-md transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Your First Certification
                        </button>
                    </div>
                ) : (
                    certifications.map((cert) => (
                        <CertificationEntry key={cert.id} certification={cert} isEditing={editingEntryId === cert.id} onUpdate={updateCertification} onDelete={deleteCertification} onDuplicate={duplicateCertification} onToggleEdit={toggleEditEntry} onMoveUp={moveCertificationUp} onMoveDown={moveCertificationDown} />
                    ))
                )}
            </div>
        </div>
    );
};
