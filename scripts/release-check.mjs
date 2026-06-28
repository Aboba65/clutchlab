import { execSync } from "node:child_process";

const checks = [
  {
    name: "Validate data",
    command: "npm run validate:data",
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
