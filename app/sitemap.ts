import type { MetadataRoute } from "next";
import { PROJECTS } from "./data/projects";

const BASE = "https://pedroferreira.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/projects", "/about"].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const projects = PROJECTS.map((p) => ({
    url: `${BASE}/projects/${p.slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...routes, ...projects];
}
