import React from 'react';

const RefundPolicy = () => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-black text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Refund Policy</h1>

        <div className="bg-gray-900 p-8 rounded-lg shadow border border-gray-800">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">1. Digital games</h2>
            <p className="text-gray-300">
              Due to the nature of digital games, all sales are final unless otherwise required by law.
              We do not offer refunds for digital purchases once the content has been accessed or downloaded.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">2. Refund Eligibility</h2>
            <p className="text-gray-300">
              Refunds may be considered under the following circumstances:
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-300">
              <li>Technical issues preventing access to the content</li>
              <li>Duplicate purchases</li>
              <li>Unauthorized transactions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">3. Refund Process</h2>
            <p className="text-gray-300">
              To request a refund, please contact our support team within 7 days of purchase.
              Include your order number and reason for the refund request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">4. Processing Time</h2>
            <p className="text-gray-300">
              Approved refunds will be processed within 5-10 business days,
              depending on your payment method and financial institution.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;