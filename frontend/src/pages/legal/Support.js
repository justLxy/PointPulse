import React, { useState } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    "Account Management": [
      {
        question: "I forgot my password. What should I do?",
        answer: "On the login page, click 'Forgot Password' and enter your UTORid. A password reset token will be generated for you, which you can use on the reset page to set a new password."
      },
      {
        question: "How can I update my personal information?",
        answer: "Once logged in, navigate to your profile page. From there, you can update your name, display email, birthday, and profile avatar."
      },
      {
        question: "Why is my account not verified?",
        answer: "Account verification is performed by a Manager to confirm your status as a member of the University of Toronto community. You may need to present a valid ID at a participating location. Verification is required to access certain features like point transfers."
      },
       {
        question: "Why can't I delete my own account?",
        answer: "To ensure transaction integrity and maintain a clear audit trail, users cannot delete their own accounts. This policy helps maintain a secure and transparent environment for everyone. Please contact an administrator for assistance if you wish to close your account."
      }
    ],
    "Points & Transactions": [
      {
        question: "My points from a recent purchase are missing. Why?",
        answer: "There might be a slight delay in processing. If the cashier who served you is flagged as 'suspicious' by the system, the points for that transaction will be pending until a Manager approves it. If the points do not appear after 24 hours, please contact support."
      },
      {
        question: "How do I use my points for a discount?",
        answer: "From your dashboard, you can initiate a 'Redemption' request for the number of points you wish to use. This creates a redemption transaction. Show the transaction ID to a Cashier, and they will process it to apply the discount to your purchase."
      },
      {
        question: "I see an incorrect transaction. What should I do?",
        answer: "If you find an error in your transaction history, please contact a Manager. They have the authority to make adjustments and correct any discrepancies."
      },
       {
        question: "How do I transfer points to another user?",
        answer: "As long as your account is verified, you can go to the 'Transfer' page and enter the recipient's UTORid and the amount of points you wish to send. The transfer is instant."
      }
    ],
     "Events & Promotions": [
      {
        question: "How do I sign up for an event?",
        answer: "Visit the 'Events' page to browse all published events. You can view details and RSVP for any event that still has available capacity."
      },
      {
        question: "How are points awarded at events?",
        answer: "The event organizer or a manager will award points to guests who have RSVP'd and checked in. Points can be awarded to individuals (e.g., for winning a prize) or to all attendees."
      },
      {
          question: "How do I apply a 'one-time' promotion?",
          answer: "One-time promotions, like a coupon for bonus points, must be applied by a Cashier during a purchase transaction. Inform the cashier of the promotion you wish to use, and they will add it to your sale."
      }
    ]
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
