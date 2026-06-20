import type { MetadataRoute } from "next";
import { blogPosts, SITE_URL } from "@/lib/blog-posts";
import { games } from "@/constants/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/games`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/pages/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/pages/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/pages/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/pages/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/pages/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/pages/refund`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
  ];

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const gamePages: MetadataRoute.Sitemap = games.slice(0, 10).map((game) => ({
    url: `${SITE_URL}${game.href}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...gamePages];
}
