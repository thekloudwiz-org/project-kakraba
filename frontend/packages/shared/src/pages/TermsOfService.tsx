/**
 * Terms of Service Page
 * 
 * Legal terms and conditions for using the platform
 * Validates: Requirements 11.6
 */

import React from 'react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        
        <p className="text-sm text-gray-600 mb-8">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Kakraba ("the Platform"), you accept and agree to be bound by these 
              Terms of Service. If you do not agree to these terms, please do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="mb-4">
              Kakraba is a platform that connects content creators with fans, enabling:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Creators to upload, manage, and monetize digital content</li>
              <li>Fans to discover, purchase, and access creator content</li>
              <li>Secure payment processing and content delivery</li>
              <li>Analytics and insights for creators</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Registration</h3>
            <p className="mb-4">
              You must create an account to use certain features. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Age Requirement</h3>
            <p>
              You must be at least 18 years old to use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Creator Terms</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Content Ownership</h3>
            <p className="mb-4">
              You retain ownership of content you upload. By uploading content, you grant us a license to:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Store and deliver your content to authorized users</li>
              <li>Display previews and thumbnails</li>
              <li>Process content for platform functionality</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Content Guidelines</h3>
            <p className="mb-4">You agree not to upload content that:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Violates intellectual property rights</li>
              <li>Contains illegal or harmful material</li>
              <li>Violates privacy or publicity rights</li>
              <li>Contains malware or malicious code</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Revenue Sharing</h3>
            <p>
              Platform fees and revenue sharing terms are outlined in your creator agreement. 
              Payments are processed through Stripe and subject to their terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Fan Terms</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Content Access</h3>
            <p className="mb-4">
              When you purchase content, you receive a license to:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Stream content for personal use</li>
              <li>Download content within quota limits</li>
              <li>Access content according to purchase terms</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Prohibited Uses</h3>
            <p className="mb-4">You may not:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Share, redistribute, or resell purchased content</li>
              <li>Circumvent access controls or DRM</li>
              <li>Use content for commercial purposes without permission</li>
              <li>Reverse engineer or extract content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payments and Refunds</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Payment Processing</h3>
            <p className="mb-4">
              All payments are processed securely through Stripe. By making a purchase, you agree to 
              Stripe's terms of service.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Refund Policy</h3>
            <p className="mb-4">
              Refunds are handled on a case-by-case basis. Generally:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Digital content sales are final once accessed</li>
              <li>Subscriptions can be canceled but are not refunded</li>
              <li>Technical issues may qualify for refunds</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="mb-4">
              The Platform and its original content, features, and functionality are owned by Kakraba 
              and protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You may not copy, modify, distribute, or create derivative works without our express permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
            <p>
              Your use of the Platform is also governed by our Privacy Policy. We are committed to 
              protecting your personal data in compliance with GDPR and other applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Prohibited Conduct</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Infringe on others' rights</li>
              <li>Transmit harmful code or malware</li>
              <li>Attempt unauthorized access to systems</li>
              <li>Interfere with platform operation</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Engage in fraudulent activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Content Moderation</h2>
            <p className="mb-4">
              We reserve the right to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Review and moderate content</li>
              <li>Remove content that violates these terms</li>
              <li>Suspend or terminate accounts for violations</li>
              <li>Report illegal activity to authorities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Disclaimers</h2>
            <p className="mb-4">
              THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, 
              EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND 
              NON-INFRINGEMENT.
            </p>
            <p>
              We do not guarantee uninterrupted or error-free service, and we are not responsible for 
              content uploaded by users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, KAKRABA SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Kakraba from any claims, damages, losses, and 
              expenses arising from your use of the Platform or violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your account at any time for:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Violation of these terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Extended inactivity</li>
              <li>Any other reason at our discretion</li>
            </ul>
            <p>
              You may terminate your account at any time through account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Governing Law</h2>
            <p>
              These terms are governed by the laws of [Your Jurisdiction], without regard to conflict 
              of law principles. Any disputes shall be resolved in the courts of [Your Jurisdiction].
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of significant 
              changes via email or platform notification. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. Contact Information</h2>
            <p className="mb-4">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Email:</strong> legal@kakraba.com</p>
              <p><strong>Support:</strong> support@kakraba.com</p>
              <p><strong>Address:</strong> [Your Company Address]</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            By using Kakraba, you acknowledge that you have read, understood, and agree to be bound by 
            these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};
