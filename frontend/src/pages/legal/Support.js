import React, { useState } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import faqAccountManagement from '../../data/faqAccountManagement';
import faqPointsTransactions from '../../data/faqPointsTransactions';
import faqEvents from '../../data/faqEvents';
import faqPromotions from '../../data/faqPromotions';

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-gray-800">{question}</h3>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="mt-4 text-gray-600 leading-relaxed">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

const Support = () => {
  const faqs = {
    "Account Management": faqAccountManagement,
    "Points & Transactions": faqPointsTransactions,
    "Events": faqEvents,
    "Promotions": faqPromotions
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* Header Section */}
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Support <span className="text-orange-500">Center</span>
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions and get help with our services.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            {Object.entries(faqs).map(([category, items]) => (
              <section key={category}>
                <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200">{category}</h2>
                <div className="space-y-2">
                  {items.map((faq, index) => (
                    <FaqItem key={index} question={faq.question} answer={faq.answer} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      {/* Contact Section */}
      <section className="py-16 bg-orange-500 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-black mb-4">Still Need Help?</h2>
            <p className="text-orange-100 text-xl mb-8">
              If you can't find the answer you're looking for, our support team is ready to assist you.
            </p>
            <a
              href="mailto:cssu@cdf.toronto.edu"
              className="inline-block bg-white text-orange-500 px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;
