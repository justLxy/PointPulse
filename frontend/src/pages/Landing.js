import React, { useState } from 'react';
import {
  QrCode,
  Gift,
  Calendar,
  ShoppingCart,
  Users,
  Zap,
  ChevronDown,
  CreditCard,
  Trophy,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import faqData from '../data/faqData';

/*
  Landing Page (Marketing)
  --------------------------------------------------
  - Publicly accessible.
  - If a user is already authenticated, they will be redirected to /dashboard.
  - Uses TailwindCSS utility classes for rapid styling. Tailwind stylesheet is
    loaded globally via CDN in public/index.html.
*/

// Animation variants and helpers
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

// Use this alias so we do not have to repeatedly convert every <section> tag manually
const MotionSection = motion.section;

// FAQ Component with expand/collapse functionality
const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-200 pb-6">
      <button 
        className="flex items-center justify-between w-full text-left group"
        onClick={onToggle}
      >
        <span className="text-lg font-semibold group-hover:text-blue-600 transition-colors">{question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="mt-4 text-gray-600 transition-all duration-300 ease-in-out">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

// FAQ Section Component
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-6">
      {faqData.map((faq, index) => (
        <FAQItem
          key={index}
          question={faq.question}
          answer={faq.answer}
          isOpen={openIndex === index}
          onToggle={() => toggleFAQ(index)}
        />
      ))}
    </div>
  );
};

// Interactive Screenshot Tabs Component for Platform Features
const AppScreenshotTabsSimple = ({ currentDomain }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Users,
      image: '/dashboard.png',
      description: 'View your points and activity',
      url: '/dashboard'
    },
    {
      id: 'products',
      label: 'Products',
      icon: ShoppingCart,
      image: '/products.png',
      description: 'Browse product catalog',
      url: '/products'
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="h-auto">
      {/* Browser Header */}
      <div className="bg-gray-100 px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <div className="w-3 h-3 bg-green-500 rounded-full" />
        </div>
        <div className="bg-white rounded px-3 py-1 text-xs text-gray-600">{currentDomain}{activeTabData?.url}</div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 px-4 py-3 bg-gray-50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="relative bg-gray-50">
        {/* Screenshot Display with Scroll */}
        <div className="h-96 bg-gray-100 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-gray-200">
          <img
            key={activeTab}
            src={activeTabData?.image}
            alt={activeTabData?.label}
            className="w-full h-auto object-cover transition-opacity duration-300 ease-in-out"
          />
        </div>
      </div>
    </div>
  );
};

// Interactive Screenshot Tabs Component
const AppScreenshotTabs = ({ currentDomain }) => {
  const [activeTab, setActiveTab] = useState('transactions');

  const tabs = [
    {
      id: 'transactions',
      label: 'Create Transaction',
      icon: ShoppingCart,
      image: '/create_transaction.png',
      description: 'Process purchases and earn points',
      url: '/transactions/create'
    },
    {
      id: 'events',
      label: 'Events',
      icon: Calendar,
      image: '/events.png',
      description: 'Attend events and earn bonuses',
      url: '/events'
    },
    {
      id: 'promotions',
      label: 'Promotions',
      icon: Zap,
      image: '/promotions.png',
      description: 'Special offers and deals',
      url: '/promotions?started=true&ended=false'
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="h-auto">
      {/* Browser Header */}
      <div className="bg-gray-100 px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <div className="w-3 h-3 bg-green-500 rounded-full" />
        </div>
        <div className="bg-white rounded px-3 py-1 text-xs text-gray-600">{currentDomain}{activeTabData?.url}</div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 px-4 py-3 bg-gray-50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="relative bg-gray-50">
        {/* Screenshot Display */}
        <div className="flex items-center justify-center bg-gray-50">
          <div className="relative w-full">
            <img
              key={activeTab}
              src={activeTabData?.image}
              alt={activeTabData?.label}
              className="w-full h-auto object-contain transition-opacity duration-300 ease-in-out"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Landing = () => {
  const { isAuthenticated } = useAuth();

  // Get current domain dynamically
  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'pointpulse.com';

  if (isAuthenticated) {
    // Authenticated users should bypass the marketing site
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white min-h-screen flex items-center justify-center"
      >
        {/* Decorative Elements */}
        <motion.div
          className="absolute top-20 left-20 w-16 h-16 bg-blue-500 rounded-full opacity-80"
          animate={{ y: [0, -20, 0, 20, 0], x: [0, 10, 0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-40 right-32 w-12 h-12 bg-pink-500 rounded-full opacity-80"
          animate={{ y: [0, 15, 0, -15, 0], x: [0, -10, 0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute top-60 left-1/4 w-8 h-8 bg-yellow-400 rounded-full opacity-80"
          animate={{ y: [0, -10, 0, 10, 0], x: [0, 8, 0, -8, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black mb-3 lg:mb-4">Your points</h1>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-blue-500 mb-4 lg:mb-6">Your rewards</h1>
              <p className="text-lg lg:text-xl text-gray-600 mb-6 lg:mb-8 px-4 lg:px-0">
                Where points pulse with possibility at University of Toronto.
              </p>
              <Link
                to="/login"
                className="group relative inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 lg:px-8 py-3 lg:py-4 font-mono font-bold text-white transition-colors duration-300 ease-linear hover:bg-blue-700 before:absolute before:right-1/2 before:top-1/2 before:-z-[1] before:h-3/4 before:w-2/3 before:origin-bottom-left before:-translate-y-1/2 before:translate-x-1/2 before:animate-ping before:rounded-full before:bg-blue-500 hover:before:bg-blue-700"
              >
                <ChevronDown className="w-5 h-5 -rotate-90 transition-transform duration-300 group-hover:-rotate-90" />
                Login
              </Link>
            </div>
            
            {/* Right Image */}
            <div className="flex justify-center order-1 lg:order-2 mb-6 lg:mb-0">
              <div className="relative">
                {/* iPhone Frame */}
                <div className="relative bg-black rounded-[2rem] lg:rounded-[3rem] p-1 shadow-2xl w-64 sm:w-72 lg:w-80 xl:w-96 mx-auto">
                  {/* iPhone Screen */}
                  <div className="bg-white rounded-[1.75rem] lg:rounded-[2.5rem] overflow-hidden relative pt-10 lg:pt-12">
                    {/* Status Bar Area */}
                    <div className="absolute top-0 left-0 right-0 h-10 lg:h-12 bg-white z-20 flex items-center justify-between px-6 lg:px-8 pt-2 lg:pt-3">
                      {/* Left side - Time */}
                      <div className="text-black font-semibold text-xs lg:text-sm">9:41</div>
                      {/* Right side - Status Icons */}
                      <div className="flex items-center space-x-2">
                        {/* Signal bars - more realistic design */}
                        <div className="flex items-end space-x-0.5">
                          <div className="w-1 h-1 bg-black rounded-full"></div>
                          <div className="w-1 h-1.5 bg-black rounded-full"></div>
                          <div className="w-1 h-2 bg-black rounded-full"></div>
                          <div className="w-1 h-2.5 bg-black rounded-full"></div>
                        </div>
                        {/* WiFi icon - simplified */}
                        <svg className="w-4 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 0 1 .808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 0 1-1.414 1.414zM14.95 11.05a7 7 0 0 0-9.9 0 1 1 0 0 1-1.414-1.414 9 9 0 0 1 12.728 0 1 1 0 0 1-1.414 1.414zM12.12 13.88a3 3 0 0 0-4.24 0 1 1 0 0 1-1.415-1.414 5 5 0 0 1 7.07 0 1 1 0 0 1-1.415 1.414zM9 16a1 1 0 0 1 2 0 1 1 0 0 1-2 0z" clipRule="evenodd" />
                        </svg>
                        {/* Battery */}
                        <div className="w-6 h-3 border border-black rounded-sm relative">
                          <div className="absolute inset-0.5 bg-black rounded-sm"></div>
                          <div className="absolute -right-0.5 top-1/2 transform -translate-y-1/2 w-0.5 h-1.5 bg-black rounded-r-sm"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dynamic Island */}
                    <div className="absolute top-2 lg:top-3 left-1/2 transform -translate-x-1/2 w-20 lg:w-28 h-3 lg:h-5 bg-black rounded-full z-30 shadow-sm"></div>
                    
                    {/* Hero Image */}
                    <img 
                      src="/hero.jpg" 
                      alt="PointPulse Hero" 
                      className="w-full h-auto relative z-10"
                    />
                  </div>
                  {/* iPhone Home Indicator */}
                  <div className="absolute bottom-1.5 lg:bottom-2 left-1/2 transform -translate-x-1/2 w-24 lg:w-32 h-0.5 lg:h-1 bg-white rounded-full opacity-80"></div>
                </div>
                {/* Floating decorative elements around image */}
                <div className="absolute -top-2 lg:-top-4 -left-2 lg:-left-4 w-6 lg:w-8 h-6 lg:h-8 bg-yellow-400 rounded-full opacity-90 animate-pulse" />
                <div className="absolute -bottom-2 lg:-bottom-4 -right-2 lg:-right-4 w-4 lg:w-6 h-4 lg:h-6 bg-pink-500 rounded-full opacity-90 animate-pulse" />
                <div className="absolute top-1/2 -right-4 lg:-right-8 w-3 lg:w-4 h-3 lg:h-4 bg-blue-500 rounded-full opacity-90 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* Mobile App Features Section */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-20 bg-yellow-50"
      >
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-black mb-6">
                Your Rewards Platform,
                <br />
                <span className="text-orange-500">Always Ready</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Browse products, check your balance, and redeem rewards on the go. Everything you need for your loyalty
                program in one convenient web platform.
              </p>
              <div className="space-y-4">
                {['Real-time point balance', 'Product catalog browsing', 'Event RSVP and check-in'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Interactive Preview with Real Screenshots */}
            <div className="relative">
              <div className="bg-orange-400 rounded-3xl p-8 shadow-xl">
                <div className="rounded-2xl overflow-hidden p-1 shadow-2xl">
                  <div className="bg-white rounded-xl overflow-hidden">
                    <AppScreenshotTabsSimple currentDomain={currentDomain} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* Tier System Section */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-20 bg-red-50"
      >
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Tier System Explanation */}
            <div className="relative">
              <div className="bg-red-400 rounded-3xl p-8 shadow-xl">
                <div className="bg-white rounded-3xl p-6 shadow-inner">
                  <div className="text-center mb-6">
                    <Trophy className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-gray-800 mb-1">How Tier Status Works</h3>
                    <p className="text-gray-600 text-xs">Annual cycle with extended benefits</p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Cycle Period */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">Tier Cycle</div>
                        <div className="text-xs text-gray-600">Sep 1st - Aug 31st annually</div>
                      </div>
                    </div>

                    {/* Extended Benefits */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">Extended Benefits</div>
                        <div className="text-xs text-gray-600">Keep tier for current + next cycle</div>
                      </div>
                    </div>

                    {/* Maximum Duration */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Gift className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">Maximum Duration</div>
                        <div className="text-xs text-gray-600">Up to 2 years of benefits</div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Timeline */}
                  <div className="mt-6 bg-gray-50 rounded-xl p-3">
                    <div className="text-center text-xs font-semibold text-gray-700 mb-2">Timeline Example</div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="text-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mb-1"></div>
                        <div className="text-xs">Earn Gold</div>
                        <div className="text-xs">Oct 2024</div>
                      </div>
                      <div className="flex-1 h-0.5 bg-red-300 mx-2"></div>
                      <div className="text-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mb-1"></div>
                        <div className="text-xs">Keep Gold</div>
                        <div className="text-xs">Aug 2026</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Content */}
            <div>
              <h2 className="text-5xl font-black mb-6">
                <span className="text-red-500">Tier-based</span>
                <br />
                product access
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Unlock exclusive products as you earn more points. Our tier system gives loyal users access to premium items
                that last for the current and following year.
              </p>
              <div className="space-y-4">
                {[
                  'Bronze, Silver, Gold, Platinum, Diamond tiers',
                  'Tier-exclusive product catalog',
                  'Premium items for higher tiers',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* Point Earning Activities Section */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-20 bg-orange-50"
      >
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-black mb-6">
                Multiple ways
                <br />
                <span className="text-blue-500">to earn points</span>
              </h2>
              <div className="space-y-6">
                {/* Purchases */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Purchases</div>
                    <div className="text-gray-600">Earn 1 point for every 25¢ spent</div>
                  </div>
                </div>
                {/* Events */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Events</div>
                    <div className="text-gray-600">Attend events and earn bonus points</div>
                  </div>
                </div>
                {/* Promotions */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Promotions</div>
                    <div className="text-gray-600">Take advantage of special offers</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Preview with Real Screenshots */}
            <div className="relative">
              <div className="bg-blue-400 rounded-3xl p-8 shadow-xl">
                <div className="rounded-2xl overflow-hidden p-1 shadow-2xl">
                  <div className="bg-white rounded-xl overflow-hidden">
                    <AppScreenshotTabs currentDomain={currentDomain} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* QR Code System Section */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-20 bg-blue-50"
      >
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Mockup */}
            <div className="relative">
              <div className="bg-blue-500 text-white shadow-xl rounded-3xl overflow-hidden">
                <div className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <QrCode className="w-8 h-8" />
                      <div>
                        <div className="font-bold text-lg">One QR code for everything</div>
                        <div className="text-blue-100 text-sm">Scan to earn, redeem, and transfer</div>
                      </div>
                    </div>
                    <div className="bg-blue-400 p-4 rounded-2xl">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center">
                          <QrCode className="w-16 h-16 text-blue-500" />
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Your Universal QR Code</div>
                        <div className="text-blue-100 text-sm">Works for purchases, events, and transfers</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <h2 className="text-5xl font-black mb-6">
                <span className="text-blue-500">Universal QR</span>
                <br />
                for everything
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                One QR code handles all your transactions. Use it for purchases, event check-ins, and point transfers, simplifying every interaction on our platform.
              </p>
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">Smart & Always Ready</div>
                    <div className="text-gray-600 text-sm">Our context-aware system is always one tap away via the floating scan button.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* Transaction Tracking Section */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-20 bg-green-50"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6">Track every transaction!</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Keep track of all your point activities with detailed transaction history. Filter, sort, and view your
              earning and spending patterns.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              {/* Desktop Browser Frame */}
              <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
                {/* Browser Header */}
                <div className="bg-gray-100 px-4 py-3 rounded-t-2xl flex items-center gap-3">
                  {/* Traffic Light Buttons */}
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  {/* Address Bar */}
                  <div className="flex-1 bg-white rounded-lg px-4 py-2 text-sm text-gray-600 flex items-center">
                    {currentDomain}/transactions
                  </div>
                </div>
                
                {/* Browser Content */}
                <div className="bg-white">
                  <img 
                    src="/transactions.jpg" 
                    alt="PointPulse Transactions Dashboard" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
              
              {/* Floating decorative elements around browser */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-green-400 rounded-full opacity-90 animate-pulse" />
              <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-blue-500 rounded-full opacity-90 animate-pulse" />
              <div className="absolute top-1/2 -right-8 w-4 h-4 bg-yellow-400 rounded-full opacity-90 animate-pulse" />
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
        className="py-20 bg-gray-50"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-black mb-16 text-center">
              Frequently
              <br />
              asked
              <br />
              questions
            </h2>
            <FAQSection />
          </div>
        </div>
      </MotionSection>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center">
            {/* Brand Section */}
            <div className="mb-8">
              <div className="text-3xl font-bold mb-3">PointPulse</div>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Where points pulse with possibility at the University of Toronto.
              </p>
            </div>
            
            {/* Company Links */}
            <div className="mb-8">
              <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                {[
                  { name: 'Privacy Policy', path: '/privacy-policy' },
                  { name: 'Terms of Service', path: '/terms-of-service' },
                  { name: 'Support', path: '/support' }
                ].map((link) => (
                  <Link 
                    key={link.name} 
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Copyright */}
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} PointPulse. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 