import React from 'react';
import Link from 'next/link';

const TermsAndPolicy = () => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-black text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Terms and Conditions</h1>

        <div className="bg-gray-900 p-8 rounded-lg shadow border border-gray-800 space-y-8">
          <p className="text-gray-300 leading-relaxed">
            These Terms and Conditions (&quot;Terms&quot;) govern your use of gamecrux.io and related
            services operated by GameCrux. By accessing or using our platform, you agree to these
            Terms.
          </p>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing and using this website, you accept and agree to be bound by these Terms
              and our{" "}
              <Link href="/pages/privacy" className="text-[#FFD12E] hover:underline">
                Privacy Policy
              </Link>
              . If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">2. Description of Service</h2>
            <p className="text-gray-300 leading-relaxed">
              GameCrux provides browser-based minigames and related community features. Some content
              is available for free; additional games and perks require an active paid subscription.
              We may modify, suspend, or discontinue any part of the service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">3. Accounts</h2>
            <p className="text-gray-300 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activity under your account. You must provide accurate information and
              notify us immediately of any unauthorized use at support@gamecrux.io.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">4. Subscriptions and Payments</h2>
            <p className="text-gray-300 leading-relaxed">
              Paid plans are billed according to the pricing shown at checkout. Payments are processed
              by our third-party provider. Subscription benefits, including Discord roles, are tied to
              your active plan. Refunds are governed by our{" "}
              <Link href="/pages/refund" className="text-[#FFD12E] hover:underline">
                Refund Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">5. Acceptable Use</h2>
            <p className="text-gray-300 leading-relaxed mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>Use the platform for any unlawful purpose</li>
              <li>Attempt to reverse engineer, exploit, or disrupt our games or infrastructure</li>
              <li>Share account access or resell subscription benefits</li>
              <li>Harass other users or our support team</li>
              <li>Use automated tools to scrape or abuse the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">6. Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed">
              All content on GameCrux—including games, graphics, logos, and text—is owned by GameCrux
              or its licensors and protected by copyright and other intellectual property laws. You
              receive a limited, non-transferable license to use the service for personal,
              non-commercial entertainment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">7. Disclaimer of Warranties</h2>
            <p className="text-gray-300 leading-relaxed">
              The service is provided &quot;as is&quot; without warranties of any kind. We do not
              guarantee uninterrupted access, error-free operation, or that the platform will meet
              your specific requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">8. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              To the fullest extent permitted by law, GameCrux shall not be liable for any indirect,
              incidental, or consequential damages arising from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">9. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed">
              Questions about these Terms? Contact us at{" "}
              <a href="mailto:support@gamecrux.io" className="text-[#FFD12E] hover:underline">
                support@gamecrux.io
              </a>{" "}
              or visit our{" "}
              <Link href="/pages/contact" className="text-[#FFD12E] hover:underline">
                Contact page
              </Link>
              .
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">Last updated: June 20, 2026</p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndPolicy;
