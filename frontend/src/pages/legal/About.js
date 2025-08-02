import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Heart, Target, Award, University, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const MotionSection = motion.section;

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
            About <span className="text-blue-500">PointPulse</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Transforming campus engagement through innovative rewards technology at the University of Toronto.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-20 bg-white"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-black mb-8">Our Mission</h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-12">
              PointPulse was created to revolutionize how students and staff engage with campus life at the University of Toronto. 
              We believe that meaningful participation should be rewarded, connections should be fostered, and every interaction 
              should contribute to a vibrant campus community.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-3">Community Building</h3>
                <p className="text-gray-600">
                  Connecting students, faculty, and staff through shared experiences and meaningful rewards.
                </p>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-3">Student Success</h3>
                <p className="text-gray-600">
                  Supporting student engagement and success through innovative incentive programs.
                </p>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-3">Innovation</h3>
                <p className="text-gray-600">
                  Leveraging cutting-edge technology to create seamless, engaging experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* Story Section */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-20 bg-blue-50"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-6">
                  <University className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-black mb-6">
                  Built for <span className="text-blue-500">U of T</span>
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  PointPulse was specifically designed to meet the unique needs of the University of Toronto community. 
                  Our platform understands the diverse ecosystem of students, staff, events, and services that make 
                  U of T special.
                </p>
                <p className="text-lg text-gray-600">
                  From orientation week to graduation, from research conferences to student club events, PointPulse 
                  creates a unified rewards experience that grows with you throughout your university journey.
                </p>
              </div>
              <div className="relative">
                <div className="bg-white rounded-3xl p-8 shadow-xl">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500 mb-2">2025</div>
                    <div className="text-gray-600 mb-6">Founded at University of Toronto</div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">1</span>
                        </div>
                        <span className="text-gray-700">Campus-wide integration</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">2</span>
                        </div>
                        <span className="text-gray-700">Student-centric design</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">3</span>
                        </div>
                        <span className="text-gray-700">Community-driven features</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* Values Section */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-20 bg-gray-50"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-black mb-6">Our Values</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The principles that guide everything we do at PointPulse.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Inclusivity</h3>
                <p className="text-gray-600">
                  Our platform is designed to be accessible and beneficial for every member of the U of T community.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Transparency</h3>
                <p className="text-gray-600">
                  Clear point earning, fair redemption policies, and open communication about how our system works.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Innovation</h3>
                <p className="text-gray-600">
                  Continuously improving our technology to provide the best possible user experience.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-6">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Community</h3>
                <p className="text-gray-600">
                  Fostering connections and creating shared experiences that strengthen our campus community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* Contact Section */}
      <MotionSection
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-20 bg-blue-500 text-white"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-black mb-8">Get in Touch</h2>
            <p className="text-xl text-blue-100 mb-12">
              Have questions about PointPulse? We'd love to hear from you.
            </p>
            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <Link
                to="/support"
                className="bg-white text-blue-500 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors"
              >
                Contact Support
              </Link>
              <a
                href="mailto:cssu@cdf.toronto.edu"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-blue-500 transition-colors"
              >
                Send Email
              </a>
            </div>
          </div>
        </div>
      </MotionSection>
    </div>
  );
};

export default About;