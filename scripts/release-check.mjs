import { execSync } from "node:child_process";

const checks = [
  {
    name: "Generate sitemap",
    command: "npm run generate:sitemap",
  },
  {
    name: "Validate data",
    command: "npm run validate:data",
  },
  {
    name: "Validate sources",
    command: "npm run validate:sources",
  },
  {
    name: "Validate models",
    command: "npm run validate:models",
  },
  {
    name: "Validate sample stats",
    command: "npm run validate:sample-stats",
  },
  {
    name: "Validate sample derived scores",
    command: "npm run validate:sample-derived-scores",
  },
  {
    name: "Validate score adapters",
    command: "npm run validate:score-adapters",
  },
  {
    name: "Lint source",
    command: "npm run lint",
  },
  {
    name: "Check formatting",
    command: "npm run format:check",
  },
  {
    name: "Build production bundle",
    command: "npm run build",
  },
];

console.log("ClutchLab release check");
console.log("-----------------------");

for (const check of checks) {
  console.log(`\n▶ ${check.name}`);
  console.log(`$ ${check.command}`);

  try {
    execSync(check.command, {
      stdio: "inherit",
      shell: true,
      windowsHide: true,
    });
  } catch (error) {
    console.error(`\nRelease check failed: ${check.name}`);

    if (typeof error?.status === "number") {
      process.exit(error.status);
    }

    process.exit(1);
  }
}

console.log("\nRelease check passed.");
console.log("Ready to commit and push.");
