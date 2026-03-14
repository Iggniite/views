
import db from "./db.js";
import { getViews } from "./youtube.js";

export function startTracker(io) {

  async function pollData() {
    db.all("SELECT videoId FROM videos WHERE status = 'active'", async (err, rows) => {
      for (const r of rows) {
        const videoId = r.videoId;
        const data = await getViews(videoId);

        if (!data) continue;

        db.get(
          "SELECT views FROM views WHERE videoId=? ORDER BY id DESC LIMIT 1",
          [videoId],
          (err, last) => {
            const lastViews = last ? last.views : null;
            const count = lastViews ? data.views - lastViews : 0;

            // Format time accurately to the exact minute ignoring ms execution drift
            const now = new Date();
            now.setSeconds(0, 0);
              const time = now.toLocaleTimeString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
              });
              
            db.run(
              "INSERT INTO views(videoId,time,views,count) VALUES(?,?,?,?)",
              [videoId, time, data.views, count]
            );

            io.emit("viewUpdate", { videoId, time, views: data.views, count });
          }
        );
      }
    });

    scheduleNextPoll();
  }

  function scheduleNextPoll() {
    const now = new Date();
    // Calculate ms until the Next exact minute (00 seconds)
    const msUntilNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
    setTimeout(pollData, msUntilNextMinute);
  }

  // Start the first loop alignment immediately
  scheduleNextPoll();

}
