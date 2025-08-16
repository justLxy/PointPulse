import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center">
          {/* Brand Section */}
          <div className="mb-6">
            <div className="text-2xl font-bold mb-2" style={{ color: '#3498db' }}>PointPulse</div>
            <p className="text-gray-600 text-base max-w-2xl mx-auto">
              Where points pulse with possibility at the University of Toronto.
            </p>
          </div>
          
          {/* Company Links */}
          <div className="mb-6">
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {[
                { name: 'Privacy Policy', path: '/privacy-policy' },
                { name: 'Terms of Service', path: '/terms-of-service' },
                { name: 'Support', path: '/support' }
              ].map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Copyright */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-gray-500 text-sm">
              &copy; {currentYear} PointPulse. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 