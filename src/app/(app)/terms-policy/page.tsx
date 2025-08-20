// app/terms/page.tsx
"use client";

import { useEffect } from 'react';

export default function TermsPage() {
  // Animation effect for section elements
  useEffect(() => {
    const animateSections = () => {
      const sections = document.querySelectorAll('.section-animate');
      sections.forEach((section, index) => {
        setTimeout(() => {
          section.classList.remove('opacity-0', 'translate-y-6');
          section.classList.add('opacity-100', 'translate-y-0');
        }, index * 150);
      });
    };

    const animateText = () => {
      const paragraphs = document.querySelectorAll('.text-animate');
      paragraphs.forEach((p, index) => {
        setTimeout(() => {
          p.classList.remove('opacity-0');
          p.classList.add('opacity-100');
        }, index * 100 + 500);
      });
    };

    animateSections();
    animateText();
  }, []);

  return (
    <div className="min-h-screen bg-black py-15 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with animation */}
        <header className="text-center mb-12 animate-fade-in-down">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Groills Terms & Policies
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {/* Terms of Service Section */}
        <section className="section-animate bg-black rounded-xl shadow-md p-6 mb-8 opacity-0 translate-y-6 transition-all duration-500 ease-out">
          <h2 className="text-2xl font-bold text-purple-400 mb-4 relative inline-block">
            Terms of Service
            <span className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"></span>
          </h2>
          
          <div className="space-y-4">
            <p className="text-animate opacity-0 transition-opacity duration-500">
              Welcome to Groills! These Terms of Service govern your use of our platform and services.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-500 mt-6">1. Account Registration</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-animate opacity-0 transition-opacity duration-500">
                You must be at least 10 years old to create an account.
              </li>
              <li className="text-animate opacity-0 transition-opacity duration-500">
                You are responsible for maintaining the confidentiality of your account credentials.
              </li>
              <li className="text-animate opacity-0 transition-opacity duration-500">
                You agree to provide accurate and complete information during registration.
              </li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-500 mt-6">2. Skill Exchanges</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-animate opacity-0 transition-opacity duration-500">
                Groills facilitates the exchange of skills between users but is not responsible for the quality of services exchanged.
              </li>
              <li className="text-animate opacity-0 transition-opacity duration-500">
                Users are expected to conduct themselves professionally during skill exchanges.
              </li>
              <li className="text-animate opacity-0 transition-opacity duration-500">
                Any disputes between users should be resolved amicably between the parties involved.
              </li>
            </ul>
          </div>
        </section>

        {/* Privacy Policy Section */}
        <section className="section-animate bg-black rounded-xl shadow-md p-6 mb-8 opacity-0 translate-y-6 transition-all duration-500 ease-out">
          <h2 className="text-2xl font-bold text-purple-400 mb-4 relative inline-block">
            Privacy Policy
            <span className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"></span>
          </h2>
          
          <div className="space-y-4">
            <p className="text-animate opacity-0 transition-opacity duration-500">
              Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-500 mt-6">1. Information We Collect</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-animate opacity-0 transition-opacity duration-500">
                Personal information you provide during registration (name, email, skills, etc.)
              </li>
              <li className="text-animate opacity-0 transition-opacity duration-500">
                Usage data including interactions with our platform
              </li>
              <li className="text-animate opacity-0 transition-opacity duration-500">
                Communication records between users
              </li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-500 mt-6">2. How We Use Your Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-animate opacity-0 transition-opacity duration-500">
                To facilitate skill exchanges between users
              </li>
              <li className="text-animate opacity-0 transition-opacity duration-500">
                To improve our services and user experience
              </li>
              <li className="text-animate opacity-0 transition-opacity duration-500">
                To communicate important platform updates
              </li>
            </ul>
          </div>
        </section>

        {/* Community Guidelines Section */}
        <section className="section-animate bg-black rounded-xl shadow-md p-6 mb-8 opacity-0 translate-y-6 transition-all duration-500 ease-out">
          <h2 className="text-2xl font-bold text-purple-400 mb-4 relative inline-block">
            Community Guidelines
            <span className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"></span>
          </h2>
          
          <div className="space-y-4">
            <p className="text-animate opacity-0 transition-opacity duration-500">
              To maintain a positive community, all users must adhere to these guidelines:
            </p>
            
            <div className="bg-gray-800/40 border-l-4 border-purple-600 p-4 my-4">
              <h4 className="font-semibold text-purple-400">Respect Others</h4>
              <p className="text-animate opacity-0 transition-opacity duration-500 mt-1">
                Treat all community members with respect and professionalism.
              </p>
            </div>
            
            <div className="bg-gray-800/40 border-l-4 border-purple-600 p-4 my-4">
              <h4 className="font-semibold text-purple-400">No Spam or Self-Promotion</h4>
              <p className="text-animate opacity-0 transition-opacity duration-500 mt-1">
                The platform is for skill exchanges, not commercial promotion.
              </p>
            </div>
            
            <div className="bg-gray-800/40 border-l-4 border-purple-600 p-4 my-4">
              <h4 className="font-semibold text-purple-400">Quality Exchanges</h4>
              <p className="text-animate opacity-0 transition-opacity duration-500 mt-1">
                Provide the same quality of service you would expect to receive.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="section-animate bg-black rounded-xl shadow-md p-6 opacity-0 translate-y-6 transition-all duration-500 ease-out">
          <h2 className="text-2xl font-bold text-purple-400 mb-4 relative inline-block">
            Contact Us
            <span className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"></span>
          </h2>
          
          <p className="text-animate opacity-0 transition-opacity duration-500">
            If you have any questions about these Terms & Policies, please contact us at:
          </p>
          
          <div className="mt-4 space-y-2">
            <p className="text-animate opacity-0 transition-opacity duration-500">
              <span className="font-semibold">Email:</span> support@skillswap.com
            </p>
            <p className="text-animate opacity-0 transition-opacity duration-500">
              <span className="font-semibold">Support Hours:</span> Monday-Friday, 9AM-5PM EST
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}