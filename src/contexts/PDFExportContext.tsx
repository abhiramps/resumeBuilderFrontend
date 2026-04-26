import React, { createContext, useContext, useMemo, useRef, useState } from 'react';

interface PDFExportContextType {
    previewRef: React.RefObject<HTMLDivElement>;
    zoom: number;
    setZoom: (zoom: number) => void;
    printMode: boolean;
    setPrintMode: (printMode: boolean) => void;
}

const PDFExportContext = createContext<PDFExportContextType | undefined>(undefined);

export const PDFExportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const previewRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(100);
    const [printMode, setPrintMode] = useState(false);

    const value = useMemo<PDFExportContextType>(
        () => ({ previewRef, zoom, setZoom, printMode, setPrintMode }),
        [zoom, printMode]
    );

    return (
        <PDFExportContext.Provider value={value}>
            {children}
        </PDFExportContext.Provider>
    );
};

export const usePDFExportContext = () => {
    const context = useContext(PDFExportContext);
    if (!context) {
        throw new Error('usePDFExportContext must be used within PDFExportProvider');
    }
    return context;
};
