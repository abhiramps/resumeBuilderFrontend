/**
 * Landing Page
 * Eye-catching and minimal landing page showcasing resume builder features
 */

import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Palette,
  Download,
  Share2,
  History,
  Upload,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Mail,
  Phone,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { SEO } from "../components/common/SEO";

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Shield,
      title: "ATS-Optimized",
      description:
        "Built specifically to pass Applicant Tracking Systems with 100% parseability",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Zap,
      title: "Real-Time Preview",
      description: "See your changes instantly with live preview as you edit",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Palette,
      title: "Multiple Templates",
      description:
        "Choose from 4 professional templates designed for software engineers",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: FileText,
      title: "Highly Customizable",
      description:
        "Control every detail: fonts, colors, margins, spacing, and more",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Download,
      title: "PDF Export",
      description: "Generate high-quality, print-ready PDFs with one click",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: History,
      title: "Version Control",
      description: "Track changes and revert to previous versions anytime",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      icon: Share2,
      title: "Easy Sharing",
      description: "Share your resume with recruiters via secure links",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      icon: Upload,
      title: "Import/Export",
      description: "Import existing resumes or export your data in JSON format",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SEO 
        title="Free ATS Resume Builder for Software Engineers" 
        description="Build professional, ATS-friendly resumes for free. 100% free resume builder with PDF export, real-time preview, and developer-focused templates."
        keywords={["free resume builder", "completely free cv maker", "free pdf resume", "software engineer resume free"]}
      />
      
      {/* Navigation */}
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 min-w-0">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            <span className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              ResumeBuilder
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <a
              href="https://mail.google.com/mail/?view=cm&to=abhiramps776@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 hover:text-gray-900 font-medium transition-colors hidden sm:block"
            >
              Contact Us
            </a>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 xl:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 rounded-full mb-6 sm:mb-8">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-blue-600">
              <span className="hidden sm:inline">ATS-Friendly Resume Builder for Software Engineers</span>
              <span className="sm:hidden">ATS Resume Builder</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
            Build Resumes That Get You Hired{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              For Free
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
            Create professional, ATS-optimized resumes with our powerful editor.
            Completely free, forever. Real-time preview, multiple templates, and unlimited PDF exports.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/signup"}
              className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <span>Start Building</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all border-2 border-gray-200 text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Everything You Need
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Powerful features designed to help you create the perfect resume
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-6 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div
                    className={`inline-flex p-3 rounded-lg ${feature.bgColor} mb-4`}
                  >
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Ready to Build Your Perfect Resume?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Join thousands of software engineers who trust our platform to
              create ATS-friendly resumes
            </p>
            <Link
              to={isAuthenticated ? "/dashboard" : "/signup"}
              className="inline-flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold text-gray-900">
                  ResumeBuilder
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Create professional, ATS-optimized resumes that get you hired.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to={isAuthenticated ? "/dashboard" : "/signup"}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Get Started
                  </Link>
                </li>
                <li>
                  <a
                    href="https://mail.google.com/mail/?view=cm&to=abhiramps776@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                {!isAuthenticated && (
                  <li>
                    <Link
                      to="/login"
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Sign In
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Contact Information
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://mail.google.com/mail/?view=cm&to=abhiramps776@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span>abhiramps776@gmail.com</span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+919745991905"
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span>+91 97459 91905</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Follow Us
              </h3>
              <div className="flex items-center space-x-4">
                <a
                  href="https://www.instagram.com/_abhiram.me?igsh=dHdxcW1jbGZ4bjBn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com/resumebuilder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-all"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/abhiramps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://github.com/abhiramps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col items-center space-y-4">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} ResumeBuilder. All rights reserved.
              </p>
              <p className="text-sm text-gray-500">
                Designed and developed by{" "}
                <a
                  href="https://www.instagram.com/_abhiram.me?igsh=dHdxcW1jbGZ4bjBn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Abhiram
                </a>
              </p>
              <div className="flex items-center space-x-6">
                <Link
                  to="/privacy-policy"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};
