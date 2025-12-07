import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { SEO } from "../components/common/SEO";

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <SEO
        title="Terms of Service"
        description="Terms and conditions for using ResumeBuilder"
        useCompanyTitle={true}
      />

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12">
          {/* Header */}
          <div className="border-b border-gray-100 pb-8 mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
            </div>
            <p className="text-gray-500">Last updated: December 7, 2025</p>
          </div>

          {/* Content */}
          <div className="prose prose-blue max-w-none text-gray-600">
            <p className="text-lg leading-relaxed mb-8">
              Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the ResumeBuilder website (the "Service") operated by ResumeBuilder ("us", "we", or "our").
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-6">
              By accessing and using the Service, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="mb-6">
              ResumeBuilder provides users with tools to create, edit, and export resumes. The Service is currently provided free of charge, though we reserve the right to introduce premium features in the future.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="mb-6">
              To access certain features of the Service, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for any activities or actions under your account.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Content Ownership and Rights</h2>
            <p className="mb-6">
              You retain all rights to the resumes you create using our Service. By using the Service, you grant us a license to store and process your content solely for the purpose of providing the Service to you. We do not claim ownership over your content.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Acceptable Use</h2>
            <p className="mb-6">
              You agree not to use the Service to create any content that is illegal, offensive, or violates the rights of others. You also agree not to interfere with or disrupt the Service or servers or networks connected to the Service.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Disclaimer of Warranties</h2>
            <p className="mb-6">
              The Service is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, regarding the operation of the Service or the information, content, or materials included on the Service.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="mb-6">
              In no event shall ResumeBuilder be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Changes to Terms</h2>
            <p className="mb-6">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at{" "}
              <a href="mailto:abhiramps776@gmail.com" className="text-primary hover:underline">
                abhiramps776@gmail.com
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
