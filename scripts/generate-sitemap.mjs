import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

const siteUrl = "https://clutchlab-olive.vercel.app";
const sitemapPath = resolve(rootDir, "public", "sitemap.xml");

const staticRoutes = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/players", priority: "0.9", changefreq: "weekly" },
  { path: "/teams", priority: "0.9", changefreq: "weekly" },
  { path: "/maps", priority: "0.8", changefreq: "weekly" },
  { path: "/roles", priority: "0.8", changefreq: "weekly" },
  { path: "/compare", priority: "0.8", changefreq: "weekly" },
  { path: "/team-compare", priority: "0.8", changefreq: "weekly" },
  { path: "/roster-builder", priority: "0.9", changefreq: "weekly" },
  { path: "/saved-rosters", priority: "0.5", changefreq: "monthly" },
  { path: "/traits", priority: "0.7", changefreq: "monthly" },
  { path: "/about", priority: "0.7", changefreq: "monthly" },
];

const sourceFiles = {
  players: resolve(rootDir, "src", "data", "players.ts"),
  teams: resolve(rootDir, "src", "data", "teams.ts"),
  maps: resolve(rootDir, "src", "config", "maps.ts"),
  roles: resolve(rootDir, "src", "config", "roles.ts"),
  meta: resolve(rootDir, "src", "data", "meta.ts"),
};

function readSource(path) {
  return readFileSync(path, "utf8");
}

function extractIds(source) {
  return [...source.matchAll(/\bid:\s*["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter(Boolean);
}

function extractLastUpdated(source) {
  const match = source.match(/\blastUpdated:\s*["']([^"']+)["']/);

  return match?.[1] ?? new Date().toISOString().slice(0, 10);
}

function uniqueRoutes(routes) {
  const seen = new Set();

  return routes.filter((route) => {
    if (seen.has(route.path)) {
      return false;
    }

    seen.add(route.path);
    return true;
  });
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

const metaSource = readSource(sourceFiles.meta);
const lastmod = extractLastUpdated(metaSource);

const players = extractIds(readSource(sourceFiles.players)).map((id) => ({
  path: `/players/${id}`,
  priority: "0.7",
  changefreq: "weekly",
}));

const teams = extractIds(readSource(sourceFiles.teams)).map((id) => ({
  path: `/teams/${id}`,
  priority: "0.7",
  changefreq: "weekly",
}));

const maps = extractIds(readSource(sourceFiles.maps)).map((id) => ({
  path: `/maps/${id}`,
  priority: "0.6",
  changefreq: "monthly",
}));

const roles = extractIds(readSource(sourceFiles.roles)).map((id) => ({
  path: `/roles/${id}`,
  priority: "0.6",
  changefreq: "monthly",
}));

const routes = uniqueRoutes([...staticRoutes, ...players, ...teams, ...maps, ...roles]);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${escapeXml(`${siteUrl}${route.path}`)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

writeFileSync(sitemapPath, xml, "utf8");

console.log("ClutchLab sitemap generated");
console.log("---------------------------");
console.log(`Routes: ${routes.length}`);
console.log(`Players: ${players.length}`);
console.log(`Teams:   ${teams.length}`);
console.log(`Maps:    ${maps.length}`);
console.log(`Roles:   ${roles.length}`);
console.log("Output:  public/sitemap.xml");
