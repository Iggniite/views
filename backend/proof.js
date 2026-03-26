import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import fs from "fs";
import path from "path";

export async function captureProof(videoId, time, views) {

  try {

    console.log("🚀 Launching Chromium...");

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });

    const page = await browser.newPage();

    const url = `https://www.youtube.com/watch?v=${videoId}`;
    console.log("🌐 Opening:", url);

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForSelector("ytd-video-primary-info-renderer", { timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    if (!fs.existsSync("proofs")) {
      fs.mkdirSync("proofs");
    }

    const fileName = `${videoId}_${Date.now()}.png`;
    const filePath = path.join("proofs", fileName);

    console.log("📸 Taking screenshot...");

    await page.setViewport({ width: 1280, height: 800 });

    await page.screenshot({
      path: filePath,
      fullPage: true
    });

    await browser.close();

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
  }
}