/**
 * Enhanced Landing Page
 * Modern, high-conversion SaaS landing page with premium animations and interactions
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  CheckCircle2,
  Menu,
  X,
  LogIn,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { SEO } from "../components/common/SEO";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { useScrollPosition } from "../hooks/useScrollPosition";

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { scrollY } = useScrollPosition();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simplified Navbar scroll state
  const isScrolled = scrollY > 20;

  const features = [
    {
      icon: Shield,
      title: "ATS-Optimized",
      description:
        "Built specifically to pass Applicant Tracking Systems with 100% parseability",
      color: "text-green-600",
      bgColor: "bg-green-50",
      gradient: "from-green-400 to-emerald-600",
    },
    {
      icon: Zap,
      title: "Real-Time Preview",
      description: "See your changes instantly with live preview as you edit",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      gradient: "from-blue-400 to-cyan-600",
    },
    {
      icon: Palette,
      title: "Multiple Templates",
      description:
        "Choose from 7 professional templates designed for software engineers",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      gradient: "from-purple-400 to-pink-600",
    },
    {
      icon: FileText,
      title: "Highly Customizable",
      description:
        "Control every detail: fonts, colors, margins, spacing, and more",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      gradient: "from-orange-400 to-red-600",
    },
    {
      icon: Download,
      title: "PDF Export",
      description: "Generate high-quality, print-ready PDFs with one click",
      color: "text-red-600",
      bgColor: "bg-red-50",
      gradient: "from-red-400 to-rose-600",
    },
    {
      icon: History,
      title: "Version Control",
      description: "Track changes and revert to previous versions anytime",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      gradient: "from-indigo-400 to-purple-600",
    },
    {
      icon: Share2,
      title: "Easy Sharing",
      description: "Share your resume with recruiters via secure links",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      gradient: "from-teal-400 to-cyan-600",
    },
    {
      icon: Upload,
      title: "Import/Export",
      description: "Import existing resumes or export your data in JSON format",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      gradient: "from-pink-400 to-rose-600",
    },
  ];

  const trustBadges = [
    { icon: CheckCircle2, text: "100% Free Forever", color: "text-green-600" },
    { icon: CheckCircle2, text: "No Credit Card", color: "text-blue-600" },
    { icon: CheckCircle2, text: "ATS-Optimized", color: "text-purple-600" },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="relative min-h-screen font-sans text-gray-900">
      <SEO
        title="Free ATS Resume Builder for Software Engineers"
        description="Build professional, ATS-friendly resumes for free. 100% free resume builder with PDF export, real-time preview, and developer-focused templates."
        keywords={[
          "free resume builder",
          "completely free cv maker",
          "free pdf resume",
          "software engineer resume free",
        ]}
      />

      {/* Background blobs and grid */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-white">
        {/* Subtle Animated Grid Pattern */}
        <motion.div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:24px_24px]"
          animate={{ 
            backgroundPosition: ["0px 0px", "24px 24px"] 
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        
        {/* Radial Gradient Overlay for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff1a,transparent)]" />

        {/* Animated Blobs */}
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-50/40 blur-[100px] animate-blob" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] rounded-full bg-purple-50/40 blur-[100px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-pink-50/40 blur-[100px] animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* Enhanced Sticky Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-lg shadow-md py-3"
            : "bg-transparent py-4 sm:py-6"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <motion.div
              className="flex items-center space-x-2 min-w-0"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src="/logo.svg"
                alt="Resume Builder"
                className="h-8 w-8 sm:h-10 sm:w-10"
              />
              <span className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                ResumeBuilder
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
              <a
                href="https://mail.google.com/mail/?view=cm&to=abhiramps776@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Contact Us
              </a>
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/signup"
                      className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-glow transition-all duration-300 ripple"
                    >
                      Get Started Free
                    </Link>
                  </motion.div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="md:hidden absolute top-full left-0 right-0 mt-2 mx-4 p-4 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
              >
                <div className="flex flex-col space-y-1">
                  <motion.a
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    href="https://mail.google.com/mail/?view=cm&to=abhiramps776@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                  >
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Contact Us</span>
                  </motion.a>

                  {isAuthenticated ? (
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                          <LayoutDashboard className="h-5 w-5" />
                        </div>
                        <span className="font-medium">Dashboard</span>
                      </Link>
                    </motion.div>
                  ) : (
                    <>
                      <motion.div
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Link
                          to="/login"
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="p-2 bg-gray-50 text-gray-600 rounded-lg group-hover:bg-gray-100 transition-colors">
                            <LogIn className="h-5 w-5" />
                          </div>
                          <span className="font-medium">Sign In</span>
                        </Link>
                      </motion.div>
                      
                      <div className="pt-2">
                        <motion.div
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Link
                            to="/signup"
                            className="flex items-center justify-center space-x-2 px-4 py-3.5 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 active:scale-95 transition-all"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <UserPlus className="h-5 w-5" />
                            <span>Get Started Free</span>
                          </Link>
                        </motion.div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      <main className="relative z-10 w-full overflow-x-hidden">
        {/* Enhanced Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-36 lg:pt-40 pb-12 sm:pb-20 lg:pb-24">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Floating Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 rounded-full mb-6 sm:mb-8 border border-blue-100"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
              </motion.div>
              <span className="text-xs sm:text-sm font-medium text-blue-600">
                <span className="hidden sm:inline">ATS-Friendly Resume Builder for Software Engineers</span>
                <span className="sm:hidden">ATS Resume Builder</span>
              </span>
            </motion.div>

            {/* Main Headline with Stagger Animation */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2"
            >
              Build Resumes That Get You Hired{" "}
              <motion.span
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
              >
                For Free
              </motion.span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4"
            >
              Create professional, ATS-optimized resumes with our powerful editor.
              Completely free, forever. Real-time preview, multiple templates, and unlimited PDF exports.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-12 px-4"
            >
              <motion.div
                className="w-full sm:w-auto"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={isAuthenticated ? "/dashboard" : "/signup"}
                  className="group w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 ripple"
                >
                  <span>Start Building</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </motion.div>
                </Link>
              </motion.div>
              {!isAuthenticated && (
                <motion.div
                  className="w-full sm:w-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all border-2 border-gray-200 hover:border-gray-300 text-center shadow-md flex items-center justify-center"
                  >
                    Sign In
                  </Link>
                </motion.div>
              )}
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              variants={containerVariants}
              className="flex flex-wrap items-center justify-center gap-6"
            >
              {trustBadges.map((badge, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-center space-x-2"
                >
                  <badge.icon className={`h-5 w-5 ${badge.color}`} />
                  <span className="text-sm font-medium text-gray-700">
                    {badge.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Enhanced Features Grid */}
        <FeaturesSection features={features} />

        {/* Enhanced CTA Section */}
        <CTASection isAuthenticated={isAuthenticated} />

        {/* Footer */}
        <Footer isAuthenticated={isAuthenticated} />

        {/* Mobile Sticky CTA */}
        <AnimatePresence>
          {!isAuthenticated && scrollY > 500 && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/90 backdrop-blur-lg border-t border-gray-200 shadow-lg"
            >
              <Link
                to="/signup"
                className="block w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold text-center shadow-lg"
              >
                Get Started Free
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

// Features Section Component
const FeaturesSection: React.FC<{ features: any[] }> = ({ features }) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Everything You Need
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-6">
            Powerful features designed to help you create the perfect resume
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, scale: 0.9, y: 20 },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: {
                      duration: 0.5,
                    },
                  },
                }}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.2 },
                }}
                className="group relative p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                {/* Icon Container */}
                <div
                  className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`h-6 w-6 ${feature.color}`} />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

// CTA Section Component
const CTASection: React.FC<{ isAuthenticated: boolean }> = ({
  isAuthenticated,
}) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section
      ref={ref}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isVisible ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 sm:p-12 lg:p-16 text-center text-white overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:32px_32px]" />
          </div>

          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2"
            >
              Ready to Build Your Perfect Resume?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-base sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4"
            >
              Join thousands of software engineers who trust our platform to create
              ATS-friendly resumes
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-4"
            >
              <Link
                to={isAuthenticated ? "/dashboard" : "/signup"}
                className="inline-flex items-center justify-center space-x-2 w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 ripple"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

// Footer Component
const Footer: React.FC<{ isAuthenticated: boolean }> = ({
  isAuthenticated,
}) => {
  return (
    <footer className={`border-t border-gray-200 bg-white ${!isAuthenticated ? "pb-24 md:pb-12" : "pb-12"}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/logo.svg" alt="Resume Builder" className="h-8 w-8" />
              <span className="text-xl font-semibold text-gray-900">
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
            <div className="flex items-center space-x-3">
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="https://www.instagram.com/_abhiram.me?igsh=dHdxcW1jbGZ4bjBn"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="https://twitter.com/resumebuilder"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-all"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="https://www.linkedin.com/in/abhiramps"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="https://github.com/abhiramps"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </motion.a>
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
  );
};