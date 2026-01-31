import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ResumeProvider } from "../../contexts/ResumeContext";
import { PDFExportProvider } from "../../contexts/PDFExportContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Preview from "./Preview";
import { LayoutControls } from "./LayoutControls";
import Footer from "./Footer";

/**
 * EditorLayout component props interface
 */
export interface EditorLayoutProps {
  /** Children components */
  children?: React.ReactNode;
  /** Custom class name */
  className?: string;
}

/**
 * Main application layout with three-panel design
 *
 * Layout Structure:
 * - Left sidebar (300px fixed) - Section editors
 * - Center preview (flexible, max 850px) - Resume preview
 * - Right sidebar (250px fixed) - Layout controls
 *
 * Responsive behavior:
 * - Desktop: Three-column layout
 * - Tablet: Stacked layout with collapsible sidebars
 * - Mobile: Single column with toggleable panels
 *
 * @example
 * ```tsx
 * <EditorLayout>
 *   <CustomContent />
 * </EditorLayout>
 * ```
 */
export const EditorLayout: React.FC<EditorLayoutProps> = ({
  children,
  className = "",
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <ResumeProvider>
      <PDFExportProvider>
        <div className={`h-screen flex flex-col bg-gray-50 ${className}`}>
          {/* Fixed Header */}
          <Header />

          {/* Main Content Area - Three Panel Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Section Editors (Dynamic width) */}
            <div 
              className={`hidden lg:flex flex-col bg-gray-50 border-r border-gray-200 flex-shrink-0 transition-all duration-300 ease-in-out relative ${
                isSidebarCollapsed ? "w-[60px]" : "w-[320px]"
              }`}
            >
              {/* Toggle Button */}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="absolute -right-3 top-3 bg-white border border-gray-200 rounded-full p-1 shadow-md z-50 hover:bg-gray-50 transition-colors text-gray-500 hover:text-primary"
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              </button>

              <div className="h-full overflow-hidden">
                <Sidebar 
                  isCollapsed={isSidebarCollapsed} 
                  onExpand={() => setIsSidebarCollapsed(false)} 
                />
              </div>
            </div>

            {/* Center - Resume Preview (flexible, max 850px) */}
            <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto min-w-0">
              <div className="max-w-[850px] mx-auto p-8">
                <Preview />
              </div>
            </div>

            {/* Right Sidebar - Layout Controls (280px fixed) */}
            <div className="hidden lg:block w-[280px] bg-gray-50 border-l border-gray-200 flex-shrink-0">
              <div className="h-full overflow-y-auto">
                <LayoutControls />
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <Footer />

          {/* Mobile Layout Overlay */}
          <div className="lg:hidden">
            {/* Mobile Sidebar Toggle */}
            <div className="fixed bottom-4 left-4 z-50">
              <button className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            {/* Mobile Layout Controls Toggle */}
            <div className="fixed bottom-4 right-4 z-50">
              <button className="bg-gray-600 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Custom Children Content */}
          {children}
        </div>
      </PDFExportProvider>
    </ResumeProvider>
  );
};

/**
 * Mobile-friendly layout variant for smaller screens
 */
export const MobileEditorLayout: React.FC<EditorLayoutProps> = ({
  children,
  className = "",
}) => {
  const [activePanel, setActivePanel] = React.useState<
    "sidebar" | "controls" | null
  >(null);

  return (
    <ResumeProvider>
      <PDFExportProvider>
        <div className={`h-screen flex flex-col bg-gray-50 ${className}`}>
          {/* Fixed Header */}
          <Header />

          {/* Main Content Area - Mobile Layout */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Mobile Sidebar Overlay */}
            {activePanel === "sidebar" && (
              <div
                className="absolute inset-0 z-40 bg-black bg-opacity-50"
                onClick={() => setActivePanel(null)}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-[300px] bg-white shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="h-full overflow-y-auto">
                    <Sidebar isCollapsed={false} />
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Controls Overlay */}
            {activePanel === "controls" && (
              <div
                className="absolute inset-0 z-40 bg-black bg-opacity-50"
                onClick={() => setActivePanel(null)}
              >
                <div
                  className="absolute right-0 top-0 bottom-0 w-[250px] bg-white shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="h-full overflow-y-auto">
                    <LayoutControls />
                  </div>
                </div>
              </div>
            )}

            {/* Center - Resume Preview */}
            <div className="flex-1 bg-gray-100 overflow-auto">
              <div className="p-4">
                <Preview />
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <Footer />

          {/* Mobile Navigation */}
          <div className="lg:hidden bg-white border-t border-gray-200 px-4 py-2">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() =>
                  setActivePanel(activePanel === "sidebar" ? null : "sidebar")
                }
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${activePanel === "sidebar"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <span>Sections</span>
              </button>

              <button
                onClick={() =>
                  setActivePanel(activePanel === "controls" ? null : "controls")
                }
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${activePanel === "controls"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  />
                </svg>
                <span>Layout</span>
              </button>
            </div>
          </div>

          {/* Custom Children Content */}
          {children}
        </div>
      </PDFExportProvider>
    </ResumeProvider>
  );
};

export default EditorLayout;
