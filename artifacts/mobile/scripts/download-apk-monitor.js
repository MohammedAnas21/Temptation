const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const buildId = "fb1e1751-d981-4e3c-8f6d-34f0a3534ae4";
const projectRoot = path.resolve(__dirname, "..");
const downloadsDir = path.join(projectRoot, "downloads");
const apkPath = path.join(downloadsDir, "temptations-cafe.apk");

fs.mkdirSync(downloadsDir, { recursive: true });

function getBuildJson() {
  const output = execSync(`eas build:view ${buildId} --json`, {
    cwd: projectRoot,
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  const match = output.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Could not parse build JSON");
  return JSON.parse(match[0]);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log(`Monitoring build ${buildId}...`);

  while (true) {
    let build;
    try {
      build = getBuildJson();
    } catch (err) {
      console.error("Failed to fetch build status:", err.message);
      await sleep(30000);
      continue;
    }

    console.log(`Status: ${build.status}`);

    if (build.status === "ERRORED") {
      console.error("Build failed. Check logs at:", build.logFiles?.[0]);
      process.exit(1);
    }

    if (build.status === "FINISHED" || build.status === "CANCELED") {
      if (!build.artifacts?.applicationArchiveUrl) {
        console.error("Build finished but no application archive URL found.");
        process.exit(1);
      }
      console.log("Downloading APK via EAS CLI...");
      execSync(`eas build:download --build-id ${buildId}`, {
        cwd: projectRoot,
        stdio: "inherit",
      });

      // Find the downloaded file in EAS cache and copy to downloads folder
      const cacheDir = path.join(
        process.env.LOCALAPPDATA || "C:\\Users\\MOHAMMED ANAS\\AppData\\Local",
        "Temp",
        "eas-cli-nodejs",
        "eas-build-run-cache",
      );
      const files = fs.existsSync(cacheDir) ? fs.readdirSync(cacheDir) : [];
      const match = files.find((f) => f.endsWith(`${buildId}.apk`));
      if (!match) {
        console.error("Downloaded APK not found in EAS cache:", cacheDir);
        process.exit(1);
      }
      const cached = path.join(cacheDir, match);
      fs.copyFileSync(cached, apkPath);
      const stats = fs.statSync(apkPath);
      console.log(`APK saved: ${apkPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      process.exit(0);
    }

    await sleep(60000);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
