import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Scale, CheckCircle, AlertTriangle, FileText, Users, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const MotionSection = motion.section;

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button */}
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
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
            Terms of <span className="text-purple-500">Service</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            The terms and conditions that govern your use of the PointPulse platform.
          </p>
          <div className="mt-6 text-sm text-gray-500">
            Last updated: December 2024
          </div>
        </div>
      </div>

      {/* Introduction */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-12 bg-white"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8 mb-12">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Scale className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-purple-800 mb-4">Agreement to Terms</h2>
                  <p className="text-purple-700 leading-relaxed">
                    By accessing and using PointPulse, you agree to be bound by these Terms of Service and all applicable laws 
                    and regulations. If you do not agree with any of these terms, you are prohibited from using this platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* Eligibility */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-16 bg-gray-50"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black mb-4">Eligibility & Account</h2>
            </div>
            
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  Who Can Use PointPulse
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-600">Current students of the University of Toronto</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-600">Faculty and staff members of the University of Toronto</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-600">Authorized representatives of university departments and organizations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-600">Users must be at least 13 years of age</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  Account Responsibilities
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600">Provide accurate and complete information when creating your account</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600">Maintain the security of your account credentials</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600">Notify us immediately of any unauthorized access to your account</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600">You are responsible for all activities that occur under your account</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* Platform Usage */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-16 bg-white"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black mb-12 text-center">Acceptable Use</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800">You May</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-green-700 text-sm">Use the platform for legitimate point earning and redemption</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-green-700 text-sm">Participate in events and promotions</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-green-700 text-sm">Transfer points to other verified users</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-green-700 text-sm">Access your transaction history and account information</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-red-800">You May Not</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">✗</span>
                    </div>
                    <span className="text-red-700 text-sm">Attempt to exploit, hack, or compromise the platform</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">✗</span>
                    </div>
                    <span className="text-red-700 text-sm">Create fake accounts or impersonate others</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">✗</span>
                    </div>
                    <span className="text-red-700 text-sm">Attempt to manipulate point balances or transactions</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">✗</span>
                    </div>
                    <span className="text-red-700 text-sm">Share your account credentials with others</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* Points and Transactions */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-16 bg-blue-50"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black mb-12 text-center">Points & Transactions</h2>
            
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold mb-6">Point System Rules</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-blue-600 mb-3">Earning Points</h4>
                    <ul className="space-y-2 text-gray-600 text-sm">
                      <li>• 1 point per $0.25 spent on eligible purchases</li>
                      <li>• Bonus points for event attendance</li>
                      <li>• Promotional point bonuses as offered</li>
                      <li>• Points are credited within 24-48 hours</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-600 mb-3">Using Points</h4>
                    <ul className="space-y-2 text-gray-600 text-sm">
                      <li>• 1 point = $0.01 redemption value</li>
                      <li>• Minimum redemption thresholds may apply</li>
                      <li>• Points can be transferred to other users</li>
                      <li>• Points do not expire</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold mb-6">Transaction Policies</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <FileText className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Transaction Records</h4>
                      <p className="text-gray-600 text-sm">All transactions are recorded and can be viewed in your account history.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <AlertTriangle className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Disputes</h4>
                      <p className="text-gray-600 text-sm">Transaction disputes must be reported within 30 days of the transaction date.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Fraud Protection</h4>
                      <p className="text-gray-600 text-sm">We reserve the right to investigate and reverse fraudulent transactions.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* Tier System */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-16 bg-white"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black mb-12 text-center">Tier System Terms</h2>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">Tier Calculation Period</h3>
                  <p className="text-gray-600 mb-4">
                    Tier status is calculated based on points earned during the annual cycle from September 1st to August 31st.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-4">Tier Benefits Duration</h3>
                  <p className="text-gray-600 mb-4">
                    Once achieved, tier benefits extend through the current cycle and the following cycle, providing up to 2 years of benefits.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-4">Tier Requirements</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Bronze</div>
                      <div className="font-bold">0+ points annually</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Silver</div>
                      <div className="font-bold">1000+ points annually</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Gold</div>
                      <div className="font-bold">5000+ points annually</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Platinum</div>
                      <div className="font-bold">10000+ points annually</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* Limitation of Liability */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-16 bg-gray-50"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black mb-12 text-center">Disclaimers & Limitations</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-yellow-800 mb-3">Service Availability</h3>
                  <p className="text-yellow-700 text-sm leading-relaxed">
                    PointPulse is provided "as is" without warranties of any kind. We do not guarantee uninterrupted service 
                    and reserve the right to modify or discontinue features with reasonable notice.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow">
                <h4 className="font-bold mb-3">Point Value Disclaimer</h4>
                <p className="text-gray-600 text-sm">
                  Points have no cash value and cannot be exchanged for money. Point values and redemption rates may be modified with 30 days notice.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow">
                <h4 className="font-bold mb-3">Third-Party Services</h4>
                <p className="text-gray-600 text-sm">
                  We are not responsible for the availability, content, or policies of third-party merchants or event organizers.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow">
                <h4 className="font-bold mb-3">Data Loss</h4>
                <p className="text-gray-600 text-sm">
                  While we maintain regular backups, we cannot guarantee against data loss and recommend keeping your own records of important transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* Changes and Contact */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-16 bg-purple-500 text-white"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black mb-6">Changes to Terms</h2>
              <p className="text-xl text-purple-100">
                We may update these terms from time to time. We will notify users of material changes via email 
                or platform notifications at least 30 days before they take effect.
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-6">Questions About These Terms?</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/support"
                  className="bg-white text-purple-500 px-8 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors"
                >
                  Contact Support
                </Link>
                <a
                  href="mailto:legal@pointpulse.ca"
                  className="border-2 border-white text-white px-8 py-3 rounded-xl font-bold hover:bg-white hover:text-purple-500 transition-colors"
                >
                  Email Legal Team
                </a>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>
    </div>
  );
};

export default TermsOfService;