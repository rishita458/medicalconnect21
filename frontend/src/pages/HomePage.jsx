import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const features = [
    {
      icon: '🏥',
      title: 'Easy Appointment Booking',
      description: 'Book appointments with your preferred doctors in just a few clicks'
    },
    {
      icon: '💊',
      title: 'Digital Prescriptions',
      description: 'Access your prescriptions online and get them filled at any pharmacy'
    },
    {
      icon: '📋',
      title: 'Medical Records',
      description: 'Keep all your medical records in one secure, accessible place'
    },
    {
      icon: '👨‍⚕️',
      title: 'Expert Doctors',
      description: 'Connect with qualified healthcare professionals anytime'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your health data is encrypted and protected with industry standards'
    },
    {
      icon: '⚡',
      title: 'Quick Access',
      description: 'Fast, reliable platform for managing your healthcare needs'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-purple-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,245,255,0.1),transparent_70%)]"></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
            <span className="text-cyan-400 text-sm font-semibold">🏥 Healthcare Management Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
            MedConnect
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
            Your comprehensive healthcare management solution
          </p>
          
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
            Connect with doctors, manage appointments, access prescriptions, and keep track of your medical records all in one secure platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/auth" 
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link 
              to="/auth" 
              className="px-8 py-4 border-2 border-cyan-500 text-cyan-400 font-semibold rounded-lg hover:bg-cyan-500/10 transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-[#09101A]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Everything You Need for <span className="text-cyan-400">Healthcare Management</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Streamline your healthcare experience with our comprehensive platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-[#09101A] border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 transform hover:-translate-y-1"
              >
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">
              How <span className="text-cyan-400">MedConnect</span> Works
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Sign Up', desc: 'Create your account as Patient, Doctor, or Pharmacist' },
              { step: '2', title: 'Book Appointment', desc: 'Schedule an appointment with your preferred doctor' },
              { step: '3', title: 'Get Prescription', desc: 'Receive digital prescriptions after consultation' },
              { step: '4', title: 'Manage Health', desc: 'Access your medical records and prescriptions anytime' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-cyan-500/50">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-cyan-900/30 via-blue-900/30 to-purple-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of patients and healthcare professionals using MedConnect
          </p>
          <Link 
            to="/auth" 
            className="inline-block px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}

