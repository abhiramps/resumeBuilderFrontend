import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { SEO } from "../components/common/SEO";

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <SEO
        title="Privacy Policy"
        description="Privacy policy for ResumeBuilder"
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
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
            </div>
            <p className="text-gray-500">Last updated: December 7, 2025</p>
          </div>

          {/* Content */}
          <div className="prose prose-blue max-w-none text-gray-600">
            <p className="text-lg leading-relaxed mb-8">
              At ResumeBuilder, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website and use our resume building service.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <div className="mb-6">
              <p className="mb-2">We collect information that you provide directly to us when you:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create an account</li>
                <li>Build or edit a resume</li>
                <li>Contact our support team</li>
              </ul>
              <p className="mt-2">This information may include your name, email address, phone number, employment history, education details, and other information you choose to include in your resume.</p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <div className="mb-6">
              <p className="mb-2">We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide, operate, and maintain our website</li>
                <li>Improve, personalize, and expand our website</li>
                <li>Understand and analyze how you use our website</li>
                <li>Develop new products, services, features, and functionality</li>
                <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website</li>
                <li>Send you emails</li>
              </ul>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Data Security</h2>
            <p className="mb-6">
              We implement appropriate technical and organizational security measures to protect your personal information against accidental or unlawful destruction, loss, alteration, unauthorised disclosure or access. However, please note that no method of transmission over the Internet or method of electronic storage is 100% secure.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Sharing Your Information</h2>
            <p className="mb-6">
              We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we povide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Your Data Rights</h2>
            <p className="mb-6">
              You have the right to access, correct, or delete your personal data. You can manage your personal information directly through your account settings or by contacting us.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Third-Party Links</h2>
            <p className="mb-6">
              Our Service may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
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
