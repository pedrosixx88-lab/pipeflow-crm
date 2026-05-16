import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://pipeflow.com.br";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/leads", "/pipeline", "/settings"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
