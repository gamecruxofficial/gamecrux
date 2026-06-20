import React from "react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-black text-white min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">About GameCrux</h1>

        <div className="bg-gray-900 p-8 rounded-lg shadow border border-gray-800 space-y-6">
          <p className="text-gray-300 leading-relaxed">
            GameCrux is a browser-based minigame platform for players who enjoy fast, skill-based
            challenges. We curate a library of reflex, memory, and puzzle games you can play
            instantly—no downloads, no installs, just click and play.
          </p>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              We believe great games do not need to be complicated or expensive to access. Our mission
              is to deliver a polished, fun experience that helps players practice real skills—focus,
              reaction speed, pattern recognition—while having a good time. Whether you play for five
              minutes or an hour, every session should feel worthwhile.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">What We Offer</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>25+ browser-based minigames across multiple skill categories</li>
              <li>Free games available without an account</li>
              <li>Affordable subscription plans for full library access</li>
              <li>Discord community with roles, support, and game suggestions</li>
              <li>Regular new releases and platform improvements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">Who We Serve</h2>
            <p className="text-gray-300 leading-relaxed">
              GameCrux is built for casual gamers, community members, streamers, and anyone who wants
              short, replayable challenges. Our games work on modern desktop and mobile browsers, so
              you can practice anywhere.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">Learn More</h2>
            <p className="text-gray-300 leading-relaxed">
              Read our{" "}
              <Link href="/blog" className="text-[#FFD12E] hover:underline">
                blog
              </Link>{" "}
              for guides and tips, browse{" "}
              <Link href="/games" className="text-[#FFD12E] hover:underline">
                free games
              </Link>
              , or reach out via our{" "}
              <Link href="/pages/contact" className="text-[#FFD12E] hover:underline">
                contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
