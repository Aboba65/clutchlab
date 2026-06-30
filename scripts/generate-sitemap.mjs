import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const siteUrl = "https://clutchlab-olive.vercel.app";

const rootDir = process.cwd();

const files = {
  players: resolve(rootDir, "src", "data", "players.ts"),
  teams: resolve(rootDir, "src", "data", "teams.ts"),
  maps: resolve(rootDir, "src", "config", "maps.ts"),
  roles: resolve(rootDir, "src", "config", "roles.ts"),
  meta: resolve(rootDir, "src", "data", "meta.ts"),
};

function read(filePath) {
  return readFileSync(filePath, "utf8");
}

function extractIds(source) {
  return [...source.matchAll(/\bid:\s*["']([^"']+)["']/g)].map((match) => match[1]);
}

function extractLastUpdated(source) {
  const match = source.match(/\blastUpdated:\s*["']([^"']+)["']/);
  return match?.[1] ?? new Date().toISOString().slice(0, 10);
}

function routeEntry(path, lastmod) {
  return [
    "  <url>",
    `    <loc>${siteUrl}${path}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    "  </url>",
  ].join("\n");
}

const lastmod = extractLastUpdated(read(files.meta));

const staticRoutes = [
  "/",
  "/players",
  "/teams",
  "/maps",
  "/roles",
  "/compare",
  "/team-compare",
  "/roster-builder",
  "/saved-rosters",
  "/sample-data",
  "/traits",
  "/about",
];

const playerRoutes = extractIds(read(files.players)).map((id) => `/players/${id}`);
const teamRoutes = extractIds(read(files.teams)).map((id) => `/teams/${id}`);
const mapRoutes = extractIds(read(files.maps)).map((id) => `/maps/${id}`);
const roleRoutes = extractIds(read(files.roles)).map((id) => `/roles/${id}`);

const routes = [
  ...staticRoutes,
  ...playerRoutes,
  ...teamRoutes,
  ...mapRoutes,
  ...roleRoutes,
];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map((route) => routeEntry(route, lastmod)),
  "</urlset>",
  "",
].join("\n");

const outputPath = resolve(rootDir, "public", "sitemap.xml");

writeFileSync(outputPath, xml, "utf8");

console.log(`Generated ${routes.length} sitemap routes at public/sitemap.xml`);
console.log(`Static routes: ${staticRoutes.length}`);
console.log(`Player routes: ${playerRoutes.length}`);
console.log(`Team routes: ${teamRoutes.length}`);
console.log(`Map routes: ${mapRoutes.length}`);
console.log(`Role routes: ${roleRoutes.length}`);
