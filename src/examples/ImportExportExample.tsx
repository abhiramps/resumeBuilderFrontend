/**
 * Import/Export Example Component
 * Demonstrates how to use the import/export functionality
 */

import React, { useState } from 'react';
import { ImportExportModal } from '../components/UI/ImportExportModal';
import { Button } from '../components/UI/Button';
import { Download, Upload } from 'lucide-react';
import type { ResumeResponse } from '../types/api.types';

// Mock resume data for demonstration
const mockResume: ResumeResponse = {
    id: 'example-resume-1',
    userId: 'user-123',
    title: 'Software Engineer Resume',
    description: 'My professional resume',
    templateId: 'modern',
    sector: 'general',
    content: {
        personalInfo: {
            fullName: 'John Doe',
            title: 'Senior Software Engineer',
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            location: 'San Francisco, CA',
            linkedin: 'linkedin.com/in/johndoe',
            github: 'github.com/johndoe',
        },
        summary: 'Experienced software engineer with 5+ years of expertise in full-stack development.',
        experience: [
            {
                id: '1',
                jobTitle: 'Senior Software Engineer',
                company: 'Tech Corp',
                location: 'San Francisco, CA',
                startDate: '2020-01',
                current: true,
                description: 'Leading development of cloud-based applications',
                achievements: [
                    'Improved system performance by 40%',
                    'Led team of 5 developers',
                ],
            },
        ],
        skills: [
            { id: '1', name: 'JavaScript', category: 'languages', level: 'expert' },
            { id: '2', name: 'React', category: 'frameworks', level: 'expert' },
            { id: '3', name: 'Node.js', category: 'frameworks', level: 'advanced' },
        ],
        education: [
            {
                id: '1',
                degree: 'Bachelor of Science in Computer Science',
                institution: 'University of California',
                location: 'Berkeley, CA',
                startDate: '2014-09',
                endDate: '2018-05',
                gpa: '3.8',
            },
        ],
    },
    status: 'published',
    isPublic: false,
    viewCount: 0,
    exportCount: 0,
    version: 1,
    isCurrentVersion: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
};

const mockResumes: ResumeResponse[] = [
    mockResume,
    {
        ...mockResume,
        id: 'example-resume-2',
        title: 'Product Manager Resume',
    },
    {
        ...mockResume,
        id: 'example-resume-3',
        title: 'Data Scientist Resume',
    },
];

export const ImportExportExample: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState<'single' | 'bulk'>('single');
    const [selectedResume, setSelectedResume] = useState<ResumeResponse | null>(null);

    const handleExportSingle = () => {
        setSelectedResume(mockResume);
        setMode('single');
        setShowModal(true);
    };

    const handleExportBulk = () => {
        setSelectedResume(null);
        setMode('bulk');
        setShowModal(true);
    };

    const handleImport = () => {
        setSelectedResume(null);
        setMode('single');
        setShowModal(true);
    };

    const handleImportSuccess = (resume: ResumeResponse) => {
        console.log('Resume imported successfully:', resume);
        alert(`Resume "${resume.title}" imported successfully!`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Import/Export Feature Demo
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Demonstration of the resume import/export functionality
                    </p>

                    {/* Feature Overview */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold">•</span>
                                <span>Export single resume in JSON, PDF, or DOCX format</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold">•</span>
                                <span>Bulk export multiple resumes as JSON</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold">•</span>
                                <span>Import resumes from JSON, PDF, or DOCX files</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold">•</span>
                                <span>Drag-and-drop file upload support</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold">•</span>
                                <span>Real-time validation and error handling</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Try It Out</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Export Single */}
                            <div className="border border-gray-200 rounded-lg p-6">
                                <h3 className="font-medium text-gray-900 mb-2">Export Single Resume</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Export one resume in your preferred format
                                </p>
                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={handleExportSingle}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Resume
                                </Button>
                            </div>

                            {/* Bulk Export */}
                            <div className="border border-gray-200 rounded-lg p-6">
                                <h3 className="font-medium text-gray-900 mb-2">Bulk Export</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Export multiple resumes as JSON
                                </p>
                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={handleExportBulk}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Export {mockResumes.length} Resumes
                                </Button>
                            </div>

                            {/* Import */}
                            <div className="border border-gray-200 rounded-lg p-6">
                                <h3 className="font-medium text-gray-900 mb-2">Import Resume</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Import from JSON, PDF, or DOCX
                                </p>
                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={handleImport}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Import Resume
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Code Example */}
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Example</h2>
                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-sm text-gray-100">
                                <code>{`import { ImportExportModal } from '../components/UI/ImportExportModal';
import { useImportExport } from '../hooks/useImportExport';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);
  const { exportAsJSON, importFromJSON } = useImportExport();

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Export Resume
      </button>

      <ImportExportModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        resume={myResume}
        mode="single"
        onImportSuccess={(resume) => {
          console.log('Imported:', resume);
        }}
      />
    </>
  );
}`}</code>
                            </pre>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-2">📝 Notes</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• JSON exports preserve all resume data</li>
                            <li>• PDF/DOCX exports require backend processing</li>
                            <li>• Bulk export only supports JSON format</li>
                            <li>• Imported resumes are created as new entries</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Import/Export Modal */}
            <ImportExportModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                resume={selectedResume || undefined}
                resumes={mode === 'bulk' ? mockResumes : []}
                mode={mode}
                onImportSuccess={handleImportSuccess}
            />
        </div>
    );
};
