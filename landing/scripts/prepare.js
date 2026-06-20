const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const outputHtml = path.join(rootDir, "index.html");
const sourceApk = path.resolve(rootDir, "..", "artifacts", "mobile", "downloads", "temptations-cafe.apk");
const localApk = path.join(rootDir, "temptations-cafe.apk");
const sourceImages = path.resolve(rootDir, "..", "images");
const localImages = path.join(rootDir, "images");

// Source HTML can live next to this script during a Vercel-only deploy,
// or in the monorepo root during local development.
const sourceHtml =
  [path.join(rootDir, "temptations-cafe.html"), path.resolve(rootDir, "..", "temptations-cafe.html")].find((p) =>
    fs.existsSync(p),
  ) || path.resolve(rootDir, "..", "temptations-cafe.html");

const apkUrl = process.env.APK_DOWNLOAD_URL?.trim() || "";

function main() {
  if (!fs.existsSync(sourceHtml)) {
    throw new Error(`Source landing page not found: ${sourceHtml}`);
  }
  console.log("✓ Source landing page:", sourceHtml);

  let html = fs.readFileSync(sourceHtml, "utf-8");

  // Determine the APK URL to use in the deployed page
  const finalApkUrl = apkUrl || "/temptations-cafe.apk";

  // Update the download button href
  html = html.replace(
    /href="\/downloads\/temptations-cafe\.apk"/g,
    `href="${finalApkUrl}"`,
  );

  // Warn if using Vercel-hosted APK and it's large
  if (!apkUrl) {
    if (!fs.existsSync(sourceApk)) {
      console.warn("⚠️  No APK_DOWNLOAD_URL set and local APK not found at:", sourceApk);
      console.warn("   The download button will still render, but the APK will not be available.");
      console.warn("   Build an APK first, or set APK_DOWNLOAD_URL to an externally hosted APK.");
    } else {
      fs.copyFileSync(sourceApk, localApk);
      const sizeMB = (fs.statSync(localApk).size / 1024 / 1024).toFixed(2);
      console.log(`✓ Copied APK to landing/ (${sizeMB} MB)`);
    }
  } else {
    console.log("✓ Using external APK_DOWNLOAD_URL:", apkUrl);
    // Remove any previously copied local APK to avoid bundling both
    if (fs.existsSync(localApk)) {
      fs.unlinkSync(localApk);
    }
  }

  // Copy menu images used by the landing page
  if (fs.existsSync(sourceImages)) {
    fs.mkdirSync(localImages, { recursive: true });
    const files = fs.readdirSync(sourceImages);
    let copied = 0;
    for (const file of files) {
      const src = path.join(sourceImages, file);
      const dest = path.join(localImages, file);
      if (fs.statSync(src).isFile()) {
        fs.copyFileSync(src, dest);
        copied++;
      }
    }
    console.log(`✓ Copied ${copied} menu images to landing/images/`);
  }

  fs.writeFileSync(outputHtml, html);
  console.log("✓ Generated index.html");
}

main();
