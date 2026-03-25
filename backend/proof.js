import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export async function captureProof(videoId, time, views) {

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"]
  });

  const page = await browser.newPage();

  const url = `https://www.youtube.com/watch?v=${videoId}`;
  await page.goto(url, { waitUntil: "networkidle2" });

  // wait for views element
  await page.waitForSelector("ytd-video-view-count-renderer", { timeout: 15000 });

  const fileName = `${videoId}_${Date.now()}.png`;
  const filePath = path.join("proofs", fileName);

  // ensure folder exists
  if (!fs.existsSync("proofs")) {
    fs.mkdirSync("proofs");
  }

  await page.screenshot({ path: filePath, fullPage: true });

  await browser.close();

  return {
    filePath,
    fileName,
    time,
    views
  };
}