import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  Search,
  ChevronDown,
  ExternalLink,
  Book,
  Users,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const MotionSection = motion.section;

// FAQ Component
const SupportFAQItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-200 pb-4">
      <button 
        className="flex items-center justify-between w-full text-left group"
        onClick={onToggle}
      >
        <span className="text-lg font-semibold group-hover:text-orange-600 transition-colors pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="mt-4 text-gray-600 transition-all duration-300 ease-in-out">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

const Support = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFAQIndex, setOpenFAQIndex] = useState(null);

  const supportFAQs = [
    {
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page and enter your email address. You will receive a password reset link via email within a few minutes.'
    },
    {
      question: 'Why are my points not showing up?',
      answer: 'Points typically appear in your account within 24-48 hours of a qualifying transaction. If your points are still missing after this time, please contact support with your transaction details.'
    },
    {
      question: 'How do I change my tier status?',
      answer: 'Tier status is automatically calculated based on your point earnings during the annual cycle (September 1 - August 31). You cannot manually change your tier status, but you can earn more points to qualify for higher tiers.'
    },
    {
      question: 'Can I transfer points to someone outside of U of T?',
      answer: 'No, point transfers are only available between verified University of Toronto community members who have active PointPulse accounts.'
    },
    {
      question: 'What should I do if my QR code is not working?',
      answer: 'Try refreshing your browser or logging out and back in. If the issue persists, ensure you have a stable internet connection and contact support if the problem continues.'
    },
    {
      question: 'How do I report a fraudulent transaction?',
      answer: 'Report any suspicious or unauthorized transactions immediately through the support contact form or by emailing security@pointpulse.ca. Include the transaction ID and details.'
    },
    {
      question: 'Can I use PointPulse without being a U of T student/staff?',
      answer: 'PointPulse is exclusively for the University of Toronto community. You must have a valid U of T email address and affiliation to create an account.'
    },
    {
      question: 'How long do points last?',
      answer: 'Points never expire and remain in your account indefinitely. However, tier status is recalculated annually based on points earned in the current cycle.'
    }
  ];

  const filteredFAQs = supportFAQs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (index) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-800 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
            Support <span className="text-orange-500">Center</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Get help with your PointPulse account, find answers to common questions, and connect with our support team.
          </p>
        </div>
      </div>

      {/* Quick Help Section */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-16 bg-white"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-black mb-12 text-center">How Can We Help?</h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HelpCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Getting Started</h3>
                <p className="text-gray-600 mb-6">
                  New to PointPulse? Learn how to create your account, earn your first points, and use the platform.
                </p>
                
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Book className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Account Issues</h3>
                <p className="text-gray-600 mb-6">
                  Having trouble with login, points, or transactions? Find solutions to common account problems.
                </p>
                
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Contact Support</h3>
                <p className="text-gray-600 mb-6">
                  Can't find what you're looking for? Get in touch with our support team for personalized help.
                </p>
               
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* FAQ Section */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-16 bg-gray-50"
        id="faq"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black mb-6">Frequently Asked Questions</h2>
              <div className="relative max-w-md mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No FAQs found matching your search.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredFAQs.map((faq, index) => (
                    <SupportFAQItem
                      key={index}
                      question={faq.question}
                      answer={faq.answer}
                      isOpen={openFAQIndex === index}
                      onToggle={() => toggleFAQ(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </MotionSection>

      {/* Contact Methods */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-16 bg-white"
        id="contact"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-black mb-12 text-center">Contact Our Support Team</h2>
            
            <div className="flex justify-center mb-12">
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 text-center max-w-md w-full">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Email Support</h3>
                <p className="text-gray-600 mb-6">
                  Send us a detailed message and we'll get back to you within 24 hours.
                </p>
                <a
                  href="mailto:cssu@cdf.toronto.edu"
                  className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  cssu@cdf.toronto.edu
                </a>
              </div>
            </div>

            {/* Support Hours */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Support Hours</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Our support team is available during the following hours. For urgent issues outside these times, 
                  please send an email and we'll respond as quickly as possible.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="space-y-4">
                  <h4 className="font-bold text-lg">Regular Support</h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span className="font-medium">9:00 AM - 6:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span className="font-medium">10:00 AM - 4:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span className="font-medium">Closed</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-bold text-lg">Emergency Support</h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Security Issues</span>
                      <span className="font-medium">24/7 via Email</span>
                    </div>
                    <div className="flex justify-between">
                      <span>System Outages</span>
                      <span className="font-medium">24/7 via Email</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-4">
                      Email: emergency@pointpulse.ca
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* Additional Resources */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-16 bg-blue-500 text-white"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-black mb-8">Additional Resources</h2>
            <p className="text-xl text-blue-100 mb-12">
              Explore more information about PointPulse policies and features.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Link
                to="/about"
                className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 p-6 rounded-xl hover:bg-opacity-20 transition-all group"
              >
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">About PointPulse</h3>
                <p className="text-blue-100 text-sm">Learn about our mission and values</p>
              </Link>
              
              <Link
                to="/privacy-policy"
                className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 p-6 rounded-xl hover:bg-opacity-20 transition-all group"
              >
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Privacy Policy</h3>
                <p className="text-blue-100 text-sm">How we protect your information</p>
              </Link>
              
              <Link
                to="/terms-of-service"
                className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 p-6 rounded-xl hover:bg-opacity-20 transition-all group"
              >
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Terms of Service</h3>
                <p className="text-blue-100 text-sm">Platform rules and policies</p>
              </Link>
            </div>
          </div>
        </div>
      </MotionSection>
    </div>
  );
};

export default Support;