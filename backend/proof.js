import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import fs from "fs";
import path from "path";

export async function captureProof(videoId, time, views) {

  let browser; // 🔥 FIX 5

  try {

    console.log("🚀 Launching Chromium...");

    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });

    const page = await browser.newPage();

    const url = `https://www.youtube.com/watch?v=${videoId}`;
    console.log("🌐 Opening:", url);

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 20000
    });

    await page.waitForSelector(
      "ytd-video-primary-info-renderer",
      { timeout: 30000 }
    );

    await new Promise(r => setTimeout(r, 3000));

    if (!fs.existsSync("/etc/data/proofs")) {
      fs.mkdirSync("/etc/data/proofs", { recursive: true });
    }

    const fileName = `${videoId}_${Date.now()}.png`;

    const filePath = path.join(
      "/etc/data/proofs",
      fileName
    );

    console.log("📸 Taking screenshot...");

      await page.setViewport({
        width: 1024,
        height: 600
      });

      await page.screenshot({
        path: filePath,
      clip: {
          x: 0,
          y: 0,
          width: 1024,
          height: 500
        }
      });

    console.log("✅ Screenshot saved:", filePath);

    return {
      filePath,
      fileName,
      time,
      views
    };

  } catch (err) {

    console.error("❌ Screenshot FAILED:", err);
    throw err;

  } finally {

    // 🔥 FIX 5: ALWAYS CLOSE CHROMIUM
    if (browser) {
      try {
        await browser.close();
        console.log("🧹 Chromium closed");
      } catch (e) {
        console.error("Failed to close browser:", e);
      }
    }

  }
}