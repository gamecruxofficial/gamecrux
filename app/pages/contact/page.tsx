import React from 'react';
import { FaDiscord } from "react-icons/fa"

const Contact = () => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-black text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Contact Us</h1>

        <div className="bg-gray-900 p-8 rounded-lg shadow border border-gray-800">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Contact Information</h2>
            <div className="text-gray-300 space-y-2">
              <p>Email: support@gamecrux.io</p>
                <p className="flex items-center">
                  Or open a ticket on Discord:&nbsp;
                  <a
                    href="https://discord.gg/PcjapvBuzy"
                    className="text-white inline-flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaDiscord className="ml-1 w-5 h-5" />
                  </a>
                </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">Business Hours</h2>
            <p className="text-gray-300">
              Monday - Friday: 9:00 AM - 6:00 PM IST<br />
              Saturday - Sunday: Closed
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            We typically respond within 2 business days
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
