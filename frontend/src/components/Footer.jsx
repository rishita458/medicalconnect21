import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#09101A] border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">MedConnect</h3>
            <p className="text-gray-400 text-sm">
              Your comprehensive healthcare management platform connecting patients, doctors, and pharmacists.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Home</Link></li>
              <li><Link to="/auth" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Sign In</Link></li>
              <li><Link to="/auth" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Sign Up</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Appointment Booking</li>
              <li>Digital Prescriptions</li>
              <li>Medical Records</li>
              <li>Secure Platform</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Email: support@medconnect.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Available 24/7</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} MedConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

