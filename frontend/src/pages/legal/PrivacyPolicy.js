import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Privacy <span className="text-green-500">Policy</span>
          </h1>
          <p className="text-lg text-gray-600">
            Your trust is important to us. Here’s how we protect your privacy.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Last Updated: August 2, 2025
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4">Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                This Privacy Policy explains how PointPulse ("we," "us," or "our") collects, uses, and discloses information about you when you use our web application and services (collectively, the "Services"). We are committed to protecting your personal information and your right to privacy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
              <p className="text-gray-600 mb-6">We collect information that you provide directly to us, information when you use our Services, and information from other sources.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">A. Information You Provide to Us</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li><strong>Account Information:</strong> When you register for an account, we collect your name, UTORid, and email address. You may also choose to provide optional information such as your birthday and a profile avatar.</li>
                    <li><strong>Authentication Data:</strong> We collect your password to secure your account. When you request a password reset, we process your UTORid and the associated reset token.</li>
                    <li><strong>Transaction Details:</strong> For certain actions like point transfers or redemption remarks, we collect the information you provide.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">B. Information We Collect Automatically</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li><strong>Transaction History:</strong> We log all transactions associated with your account, including purchases, point redemptions, transfers, event rewards, and adjustments. This includes amounts, dates, and parties involved.</li>
                    <li><strong>Event Activity:</strong> We record your RSVPs to events, check-ins, and any points awarded to you by event organizers.</li>
                    <li><strong>Usage Information:</strong> We collect standard log data, which includes your IP address, browser type, and how you interact with our Services.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">C. Information Collected by Staff</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li><strong>Account Creation:</strong> Our cashiers create user accounts and input the necessary registration details (UTORid, name, email).</li>
                    <li><strong>Purchase Transactions:</strong> Cashiers record purchase transactions, linking them to your user account via your UTORid.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-600 mb-6">We use the information we collect for various purposes, including:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>To Provide and Manage the Services:</strong> To operate your account, process your transactions, track your points balance, and allow you to participate in events and promotions.</li>
                <li><strong>For Authentication and Security:</strong> To secure your account, prevent fraud, and verify your identity when you log in or reset your password.</li>
                <li><strong>To Communicate with You:</strong> To send important account notifications. As per the project scope, direct email communication (e.g., password resets) is simulated and tokens are provided in the API response.</li>
                <li><strong>For Auditing and Internal Operations:</strong> To allow Managers and Superusers to oversee system activity, manage user roles, and ensure the integrity of the loyalty program.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. How We Share Your Information</h2>
              <p className="text-gray-600 mb-6">We do not sell your personal information. We may share it in the following limited circumstances:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>With Other Users:</strong> When you transfer points, your UTORid will be visible to the recipient in their transaction history.</li>
                <li><strong>With Staff:</strong> Cashiers can look up your basic profile information to process transactions. Managers and Superusers have broader access to manage the system and your account. Event organizers can see the guest list for events they manage.</li>
                <li><strong>For Legal Reasons:</strong> We may disclose information if required by law, regulation, or legal process.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
              <p className="text-gray-600 leading-relaxed">
                We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems and are required to keep the information confidential. All sensitive information you supply is encrypted via Secure Socket Layer (SSL) technology.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Your Rights and Choices</h2>
              <p className="text-gray-600 mb-6">You have rights regarding your personal information:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Access and Update:</strong> You can review and update your account information at any time by logging into your profile.</li>
                <li><strong>Data Portability:</strong> You can view your transaction history within the application.</li>
                <li><strong>Account Deletion:</strong> To ensure accountability and maintain a transparent transaction log, users cannot delete their own accounts. Account management is handled by system administrators.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-4">6. Changes to This Privacy Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this privacy policy from time to time. The updated version will be indicated by a "Last Updated" date and the updated version will be effective as soon as it is accessible. We encourage you to review this privacy policy frequently to be informed of how we are protecting your information.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Contact Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Questions About Privacy?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Contact us if you have any questions about this Privacy Policy or how we handle your data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/support"
                className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors"
              >
                Contact Support
              </Link>
              <a
                href="mailto:privacy@pointpulse.ca"
                className="border-2 border-white text-white px-8 py-3 rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Email Privacy Team
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
