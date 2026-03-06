import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/_next",
          "/boardroom", // extra safety: explicitly disallow
        ],
      },
    ],
    sitemap: "https://berntoutglobal.com/sitemap.xml",
  };
}