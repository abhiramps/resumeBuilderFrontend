import React from 'react';
import { 
    User, 
    FileText, 
    Briefcase, 
    GraduationCap, 
    Zap, 
    FolderOpen, 
    Award, 
    PlusCircle, 
    PenTool,
    Layout
} from 'lucide-react';
import { SectionType } from '../../types/resume.types';

interface SectionIconProps {
    type: SectionType | 'personal-info' | 'ats-score';
    className?: string;
}

export const SectionIcon: React.FC<SectionIconProps> = ({ type, className = "w-5 h-5" }) => {
    switch (type) {
        case 'personal-info':
            return <User className={className} />;
        case 'summary':
            return <FileText className={className} />;
        case 'experience':
            return <Briefcase className={className} />;
        case 'education':
            return <GraduationCap className={className} />;
        case 'skills':
            return <Zap className={className} />;
        case 'projects':
            return <FolderOpen className={className} />;
        case 'certifications':
            return <Award className={className} />;
        case 'additional-info':
            return <PlusCircle className={className} />;
        case 'custom':
            return <PenTool className={className} />;
        case 'ats-score':
             return <Layout className={className} />;
        default:
            return <PenTool className={className} />;
    }
};
