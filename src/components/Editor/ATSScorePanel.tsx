import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ATSValidation, ATSIssue } from '../../types/resume.types';
import { getScoreColor, getScoreBgColor, getIssueColor } from '../../utils/atsValidator';

interface ATSScorePanelProps {
    validation: ATSValidation;
    className?: string;
}

export const ATSScorePanel: React.FC<ATSScorePanelProps> = ({
    validation,
    className = '',
}) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [selectedType, setSelectedType] = React.useState<'all' | 'error' | 'warning' | 'info'>('all');

    const { score, issues } = validation;

    // Group issues by type
    const errorCount = issues.filter((i) => i.type === 'error').length;
    const warningCount = issues.filter((i) => i.type === 'warning').length;
    const infoCount = issues.filter((i) => i.type === 'info').length;

    // Filter issues based on selected type
    const filteredIssues = selectedType === 'all'
        ? issues
        : issues.filter((i) => i.type === selectedType);

    const getScoreLabel = (score: number): string => {
        if (score >= 90) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 50) return 'Fair';
        return 'Needs Improvement';
    };

    const IssueIcon: React.FC<{ type: ATSIssue['type'] }> = ({ type }) => {
        const color = getIssueColor(type);
        switch (type) {
            case 'error':
                return <AlertCircle className={`w-5 h-5 ${color}`} />;
            case 'warning':
                return <AlertTriangle className={`w-5 h-5 ${color}`} />;
            case 'info':
                return <Info className={`w-5 h-5 ${color}`} />;
        }
    };

    return (
        <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
            {/* Score Header */}
            <div
                className={`p-4 ${getScoreBgColor(score)} border-b border-gray-200 cursor-pointer`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            {score >= 90 ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                                <AlertCircle className={`w-6 h-6 ${getScoreColor(score)}`} />
                            )}
                            <div>
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">ATS Score</h3>
                                <p className="text-[10px] text-gray-500 uppercase font-medium">{getScoreLabel(score)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                                {score}
                            </div>
                            <div className="text-xs text-gray-500">out of 100</div>
                        </div>
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                </div>

                {/* Issue Summary */}
                {issues.length > 0 && (
                    <div className="flex items-center gap-4 mt-3 text-sm">
                        {errorCount > 0 && (
                            <span className="flex items-center gap-1 text-red-600">
                                <AlertCircle className="w-4 h-4" />
                                {errorCount} {errorCount === 1 ? 'error' : 'errors'}
                            </span>
                        )}
                        {warningCount > 0 && (
                            <span className="flex items-center gap-1 text-yellow-600">
                                <AlertTriangle className="w-4 h-4" />
                                {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
                            </span>
                        )}
                        {infoCount > 0 && (
                            <span className="flex items-center gap-1 text-blue-600">
                                <Info className="w-4 h-4" />
                                {infoCount} {infoCount === 1 ? 'suggestion' : 'suggestions'}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="p-4">
                    {issues.length === 0 ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                            <p className="text-gray-900 font-medium">Perfect ATS Compliance!</p>
                            <p className="text-sm text-gray-600 mt-1">
                                Your resume follows all ATS best practices
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Filter Tabs */}
                            <div className="flex gap-2 mb-4 border-b border-gray-200">
                                <button
                                    onClick={() => setSelectedType('all')}
                                    className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${selectedType === 'all'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    All ({issues.length})
                                </button>
                                {errorCount > 0 && (
                                    <button
                                        onClick={() => setSelectedType('error')}
                                        className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${selectedType === 'error'
                                                ? 'border-red-600 text-red-600'
                                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Errors ({errorCount})
                                    </button>
                                )}
                                {warningCount > 0 && (
                                    <button
                                        onClick={() => setSelectedType('warning')}
                                        className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${selectedType === 'warning'
                                                ? 'border-yellow-600 text-yellow-600'
                                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Warnings ({warningCount})
                                    </button>
                                )}
                                {infoCount > 0 && (
                                    <button
                                        onClick={() => setSelectedType('info')}
                                        className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${selectedType === 'info'
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Info ({infoCount})
                                    </button>
                                )}
                            </div>

                            {/* Issues List */}
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {filteredIssues.map((issue) => (
                                    <div
                                        key={issue.id}
                                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                                    >
                                        <div className="flex items-start gap-3">
                                            <IssueIcon type={issue.type} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium text-gray-900 text-sm">
                                                        {issue.message}
                                                    </h4>
                                                    {issue.section && (
                                                        <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">
                                                            {issue.section}
                                                        </span>
                                                    )}
                                                </div>
                                                {issue.suggestion && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        💡 {issue.suggestion}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ATS Tips */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 text-sm mb-2">
                            ATS Best Practices
                        </h4>
                        <ul className="text-xs text-blue-800 space-y-1">
                            <li>• Use standard fonts (Arial, Helvetica, Calibri)</li>
                            <li>• Include standard section headers</li>
                            <li>• Use simple formatting (no tables or columns)</li>
                            <li>• Include relevant keywords from job descriptions</li>
                            <li>• Keep resume to 1-2 pages</li>
                            <li>• Use standard date formats (MM/YYYY)</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
