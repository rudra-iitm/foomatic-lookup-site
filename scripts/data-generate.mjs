import { spawnSync } from "child_process";

const forwardedArgs = process.argv.slice(2);
const skipPpd = forwardedArgs.includes("--skip-ppd");
const steps = [
  ["scripts/generate-from-xml.mjs", []],
  ["scripts/generate-ppds.sh", skipPpd ? ["--skip-ppd"] : []],
  ["scripts/combine-data.mjs", forwardedArgs],
  ["scripts/split-printers.mjs", []],
];

for (const [scriptPath, args] of steps) {
  const command = scriptPath.endsWith(".sh") ? "/bin/bash" : process.execPath;
  const commandArgs = scriptPath.endsWith(".sh") ? [scriptPath, ...args] : [scriptPath, ...args];
  const result = spawnSync(command, commandArgs, {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
