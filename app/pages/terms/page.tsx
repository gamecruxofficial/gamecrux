import React from 'react';

const TermsAndPolicy = () => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-black text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Terms and Conditions</h1>

        <div className="bg-gray-900 p-8 rounded-lg shadow border border-gray-800">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
            <p className="text-gray-300">
              By accessing and using this website, you accept and agree to be bound by the terms
              and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">2. Privacy Policy</h2>
            <p className="text-gray-300">
              Your privacy is important to us. Please review our Privacy Policy to understand
              how we collect, use, and protect your personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">3. User Responsibilities</h2>
            <p className="text-gray-300">
              Users are responsible for maintaining the confidentiality of their account
              information and for all activities that occur under their account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">4. Intellectual Property</h2>
            <p className="text-gray-300">
              All content included on this website is the property of our company and
              protected by international copyright laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">5. Contact Information</h2>
            <p className="text-gray-300">
              If you have any questions about these Terms, please contact us at:
              support@gamecrux.io
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndPolicy;