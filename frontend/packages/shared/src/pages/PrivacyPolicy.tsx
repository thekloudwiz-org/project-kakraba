/**
 * Privacy Policy Page
 * 
 * GDPR-compliant privacy policy
 * Validates: Requirements 11.6
 */

import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <p className="text-sm text-gray-600 mb-8">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to Kakraba ("we," "our," or "us"). We are committed to protecting your personal 
              information and your right to privacy. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you use our platform.
            </p>
            <p>
              This policy complies with the General Data Protection Regulation (GDPR) and other applicable 
              data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Personal Information</h3>
            <p className="mb-4">We collect the following personal information:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Account information (email, password, display name)</li>
              <li>Profile information (bio, profile image)</li>
              <li>Payment information (processed securely by Stripe)</li>
              <li>Content you upload (for creators)</li>
              <li>Purchase history and subscriptions</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, features used, time spent)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use your information for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>To provide and maintain our services</li>
              <li>To process transactions and payments</li>
              <li>To send you notifications and updates</li>
              <li>To improve our platform and user experience</li>
              <li>To detect and prevent fraud and abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Legal Basis for Processing (GDPR)</h2>
            <p className="mb-4">We process your personal data based on:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Consent:</strong> You have given explicit consent for processing</li>
              <li><strong>Contract:</strong> Processing is necessary to fulfill our contract with you</li>
              <li><strong>Legal Obligation:</strong> We must process data to comply with the law</li>
              <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate business interests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your GDPR Rights</h2>
            <p className="mb-4">Under GDPR, you have the following rights:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured format</li>
              <li><strong>Right to Object:</strong> Object to processing of your data</li>
              <li><strong>Right to Restrict Processing:</strong> Request limitation of processing</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at privacy@kakraba.com or use the data 
              management tools in your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Sharing and Disclosure</h2>
            <p className="mb-4">We may share your information with:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Service Providers:</strong> AWS (hosting), Stripe (payments), Cognito (authentication)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale</li>
            </ul>
            <p className="mt-4">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Security</h2>
            <p className="mb-4">
              We implement appropriate technical and organizational measures to protect your data:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Encryption in transit (TLS 1.3) and at rest</li>
              <li>Secure authentication with AWS Cognito</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and monitoring</li>
              <li>Secure file upload validation and scanning</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
            <p>
              We retain your personal data for as long as necessary to provide our services and comply 
              with legal obligations. Specifically:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Account data: Until account deletion</li>
              <li>Transaction records: 7 years (legal requirement)</li>
              <li>Content: Until deleted by creator</li>
              <li>Analytics data: 2 years</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries outside your country of residence. 
              We ensure appropriate safeguards are in place, including:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Standard Contractual Clauses (SCCs)</li>
              <li>Adequacy decisions by the European Commission</li>
              <li>Privacy Shield certification (where applicable)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Cookies and Tracking</h2>
            <p className="mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Maintain your session</li>
              <li>Remember your preferences</li>
              <li>Analyze usage patterns</li>
              <li>Improve our services</li>
            </ul>
            <p className="mt-4">
              You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Children's Privacy</h2>
            <p>
              Our services are not intended for users under 18 years of age. We do not knowingly collect 
              personal information from children. If you believe we have collected information from a child, 
              please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              posting the new policy on this page and updating the "Last Updated" date. Significant changes 
              will be communicated via email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
            <p className="mb-4">
              If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Email:</strong> privacy@kakraba.com</p>
              <p><strong>Data Protection Officer:</strong> dpo@kakraba.com</p>
              <p><strong>Address:</strong> [Your Company Address]</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Supervisory Authority</h2>
            <p>
              If you are located in the European Economic Area (EEA), you have the right to lodge a 
              complaint with your local data protection authority if you believe we have not complied 
              with applicable data protection laws.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            By using Kakraba, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
