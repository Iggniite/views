import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export async function captureProof(videoId, time, views) {

  try {

    // 🔥 FIX 1: Proper Puppeteer config for Render
    const browser = await puppeteer.launch({
      headless: true, // ✅ safer than "new"
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ]
    });

    const page = await browser.newPage();

    const url = `https://www.youtube.com/watch?v=${videoId}`;
    console.log("🌐 Opening:", url);

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // 🔥 FIX 2: safer wait (YouTube loads dynamically)
    await page.waitForSelector("ytd-watch-flexy", { timeout: 20000 });

    // 🔥 FIX 3: ensure folder exists
    const folder = "proofs";
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }

    const fileName = `${videoId}_${Date.now()}.png`;
    const filePath = path.join(folder, fileName);

    console.log("📸 Taking screenshot...");

    // 🔥 FIX 4: viewport for better capture
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

  } catch (error) {

    // 🔥 FIX 5: SHOW ERROR (VERY IMPORTANT)
    console.error("❌ Puppeteer Error:", error);

    throw error;
  }
}