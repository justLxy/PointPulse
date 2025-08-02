import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Terms of <span className="text-purple-500">Service</span>
          </h1>
          <p className="text-lg text-gray-600">
            The rules for using our platform, explained clearly.
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
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By creating an account or using the PointPulse platform ("Services"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our Services. These terms govern your rights and obligations regarding the use of our loyalty rewards program.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Account Registration and Responsibilities</h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Accounts are created by authorized staff (Cashiers or higher). To be eligible for an account, you must be affiliated with the University of Toronto.
                </p>
                <h3 className="text-lg font-semibold">Your Responsibilities:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Accurate Information:</strong> You are responsible for ensuring that the information associated with your account, such as your name and email, is accurate and up to date.</li>
                  <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your password. You must notify an administrator immediately if you suspect any unauthorized use of your account.</li>
                  <li><strong>Account Activity:</strong> You are solely responsible for all activities that occur under your account, including all transactions.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Use of the Platform</h2>
              <p className="text-gray-600 mb-6">You agree to use the PointPulse platform only for its intended purposes. The following conduct is strictly prohibited:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Attempting to manipulate point balances, transactions, or event records through fraudulent means.</li>
                <li>Creating multiple accounts for a single individual or impersonating another person.</li>
                <li>Using the platform for any illegal or unauthorized purpose.</li>
                <li>Interfering with the security or proper functioning of the platform.</li>
                <li>Sharing your account credentials with any third party.</li>
              </ul>
              <p className="text-gray-600 mt-4">
                Violation of these rules may result in account suspension, termination, and forfeiture of points, at the sole discretion of our administrators.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Points and Transactions</h2>
              <p className="text-gray-600 mb-6">Our loyalty program is governed by the following rules:</p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Earning and Redemption:</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Points are earned on purchases at a default rate, which may be supplemented by promotions.</li>
                    <li>Points for purchases made via a "suspicious" cashier will not be awarded until the transaction is cleared by a Manager.</li>
                    <li>Points can be redeemed for discounts on purchases. Redemption requests must be processed by a Cashier.</li>
                    <li>Points have no cash value and cannot be exchanged for money.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Transaction Types:</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li><strong>Purchase:</strong> Points earned from a sale, recorded by a Cashier.</li>
                    <li><strong>Redemption:</strong> Points spent by a user, initiated by the user and finalized by a Cashier.</li>
                    <li><strong>Transfer:</strong> Points sent from one verified user to another.</li>
                    <li><strong>Event Reward:</strong> Points awarded by an event organizer to attendees.</li>
                    <li><strong>Adjustment:</strong> Manual correction of points by a Manager to rectify errors.</li>
                  </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Transaction Finality:</h3>
                    <p className="text-gray-600">
                        All transactions are final once created and cannot be deleted. Adjustments can be made by Managers to correct errors.
                    </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Roles and Permissions</h2>
              <p className="text-gray-600 mb-6">The platform has several user roles with specific permissions:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Regular Users:</strong> Can earn, redeem, and transfer points, and participate in events.</li>
                <li><strong>Cashiers:</strong> Can create user accounts and process purchase and redemption transactions.</li>
                <li><strong>Managers:</strong> Have all Cashier permissions, plus the ability to manage users, events, promotions, and all transactions.</li>
                <li><strong>Event Organizers:</strong> Can manage the details of their assigned events and award points to guests.</li>
                <li><strong>Superusers:</strong> Have full administrative access to the system.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Disclaimer of Warranties and Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                The Services are provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not guarantee that the Services will be uninterrupted or error-free. To the fullest extent permitted by law, PointPulse shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of points or profits, whether incurred directly or indirectly.
              </p>
            </section>

             <section>
              <h2 className="text-2xl font-bold mb-4">7. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these terms at any time. We will provide notice of significant changes by posting the new terms on our platform. Your continued use of the Services after such changes constitutes your acceptance of the new terms.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Contact Section */}
      <section className="py-16 bg-purple-500 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-black mb-6">Questions About These Terms?</h2>
            <p className="text-xl text-purple-100 mb-8">
              If you have any questions about this Terms of Service, please don't hesitate to reach out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/support"
                className="bg-white text-purple-500 px-8 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors"
              >
                Contact Support
              </Link>
              <a
                href="mailto:cssu@cdf.toronto.edu"
                className="border-2 border-white text-white px-8 py-3 rounded-xl font-bold hover:bg-white hover:text-purple-500 transition-colors"
              >
                Email Legal Team
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;
