import { blogPosts, SITE_URL } from "@/lib/blog-posts";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(date: string): string {
  return new Date(date).toUTCString();
}

export function GET() {
  const sortedPosts = [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const items = sortedPosts
    .map((post) => {
      const link = `${SITE_URL}/blog/${post.slug}`;
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${toRfc822(post.publishedAt)}</pubDate>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
  <channel>
    <title>GameCrux Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Guides, tips, and updates from GameCrux — a browser-based minigame platform for reflex, memory, and puzzle challenges.</description>
    <language>en</language>
    <lastBuildDate>${toRfc822(new Date().toISOString())}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
