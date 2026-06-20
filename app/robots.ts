import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/blog-posts";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/test", "/test-recurring", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
