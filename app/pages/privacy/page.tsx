import React from "react";
import Link from "next/link";

const PrivacyPolicy = () => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-black text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Privacy Policy</h1>

        <div className="bg-gray-900 p-8 rounded-lg shadow border border-gray-800 space-y-8">
          <p className="text-gray-300 leading-relaxed">
            GameCrux (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates gamecrux.io. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your information when you
            visit our website or use our services.
          </p>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">1. Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We may collect the following types of information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>
                <strong className="text-white">Account information:</strong> username, email address,
                and Discord ID when you sign in or create an account.
              </li>
              <li>
                <strong className="text-white">Payment information:</strong> processed securely by our
                payment provider (Tebex). We do not store full credit card numbers on our servers.
              </li>
              <li>
                <strong className="text-white">Usage data:</strong> pages visited, games played, browser
                type, device type, and general analytics via Google Analytics.
              </li>
              <li>
                <strong className="text-white">Communications:</strong> messages you send to support or
                game suggestions you submit.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>Provide, operate, and maintain our platform and games</li>
              <li>Process subscriptions and manage your account</li>
              <li>Assign Discord roles and community perks linked to your plan</li>
              <li>Respond to support requests and improve our services</li>
              <li>Send important service-related notices</li>
              <li>Analyze usage to improve site performance and content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">3. Cookies and Advertising</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We use cookies and similar technologies for authentication, preferences, and analytics.
              Google Analytics helps us understand how visitors use our site. If you use our site with
              advertising enabled, Google AdSense may use cookies to serve personalized ads in
              accordance with{" "}
              <a
                href="https://policies.google.com/technologies/ads"
                className="text-[#FFD12E] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google&apos;s advertising policies
              </a>
              .
            </p>
            <p className="text-gray-300 leading-relaxed">
              You can control cookies through your browser settings. Disabling cookies may limit some
              features of the site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">4. Third-Party Services</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We share limited data with trusted third parties that help us operate GameCrux:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>Discord (authentication and community features)</li>
              <li>Tebex (payment processing)</li>
              <li>Google Analytics and Google AdSense (analytics and advertising)</li>
              <li>Hosting and infrastructure providers</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              These providers are bound by their own privacy policies and process data only as needed
              to perform their services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">5. Data Retention</h2>
            <p className="text-gray-300 leading-relaxed">
              We retain account and subscription data for as long as your account is active or as
              needed to provide services, comply with legal obligations, resolve disputes, and
              enforce our agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">6. Your Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Object to or restrict certain processing</li>
              <li>Withdraw consent where processing is consent-based</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              To exercise these rights, contact us at{" "}
              <a href="mailto:support@gamecrux.io" className="text-[#FFD12E] hover:underline">
                support@gamecrux.io
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">7. Children&apos;s Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              GameCrux is not directed at children under 13. We do not knowingly collect personal
              information from children. If you believe a child has provided us data, contact us and
              we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">8. Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be posted on this page
              with an updated revision date. Continued use of the site after changes constitutes
              acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">9. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              For privacy-related questions, email{" "}
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

export default PrivacyPolicy;
