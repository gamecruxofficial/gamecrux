import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { blogPosts, getBlogPost, getAllBlogSlugs } from "@/lib/blog-posts";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Post Not Found | GameCrux" };

  return {
    title: `${post.title} | GameCrux Blog`,
    description: post.description,
  };
}

function renderContent(content: string) {
  const blocks = content.trim().split("\n\n");

  return blocks.map((block, index) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={index} className="text-xl font-semibold mt-8 mb-3 text-white">
          {block.replace("## ", "")}
        </h2>
      );
    }

    if (block.startsWith("- ")) {
      const items = block.split("\n").filter((line) => line.startsWith("- "));
      return (
        <ul key={index} className="list-disc pl-6 my-4 space-y-2 text-gray-300">
          {items.map((item, i) => (
            <li key={i}>{item.replace("- ", "")}</li>
          ))}
        </ul>
      );
    }

    if (/^\d+\.\s/.test(block)) {
      const items = block.split("\n").filter((line) => /^\d+\.\s/.test(line));
      return (
        <ol key={index} className="list-decimal pl-6 my-4 space-y-2 text-gray-300">
          {items.map((item, i) => (
            <li key={i}>{item.replace(/^\d+\.\s/, "")}</li>
          ))}
        </ol>
      );
    }

    if (block.startsWith("**") && block.includes(":**")) {
      const [label, ...rest] = block.split(":**");
      return (
        <p key={index} className="text-gray-300 leading-relaxed my-4">
          <strong className="text-white">{label.replace(/\*\*/g, "")}:</strong>
          {rest.join(":**")}
        </p>
      );
    }

    return (
      <p key={index} className="text-gray-300 leading-relaxed my-4">
        {block}
      </p>
    );
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) notFound();

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-black text-white min-h-screen">
      <article className="max-w-3xl mx-auto">
        <Link href="/blog" className="text-sm text-[#FFD12E] hover:underline">
          ← Back to Blog
        </Link>

        <header className="mt-6 mb-8">
          <time className="text-sm text-gray-500" dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h1 className="text-3xl font-bold mt-2 mb-4">{post.title}</h1>
          <p className="text-gray-400 text-lg leading-relaxed">{post.description}</p>
        </header>

        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800">
          {renderContent(post.content)}
        </div>
      </article>
    </div>
  );
}
