import Link from "next/link";
import type { Metadata } from "next";
import { blogPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Blog | GameCrux",
  description:
    "Guides, tips, and updates from GameCrux — learn how to get the most from our minigame platform.",
};

export default function BlogPage() {
  const sortedPosts = [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-black text-white min-h-screen">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold mb-3">GameCrux Blog</h1>
          <p className="text-gray-400 leading-relaxed">
            Guides, training tips, and platform updates to help you play smarter and get more
            from our minigame library.
          </p>
          <p className="text-sm text-gray-500 mt-3">
            <Link href="/feed.xml" className="text-[#FFD12E] hover:underline">
              Subscribe via RSS
            </Link>
          </p>
        </header>

        <div className="space-y-6">
          {sortedPosts.map((post) => (
            <article
              key={post.slug}
              className="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <time className="text-sm text-gray-500" dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <h2 className="text-xl font-semibold mt-2 mb-2">
                <Link href={`/blog/${post.slug}`} className="hover:text-[#FFD12E] transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-300 leading-relaxed">{post.description}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="inline-block mt-4 text-sm text-[#FFD12E] hover:underline"
              >
                Read more →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
