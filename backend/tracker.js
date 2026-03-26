import db from "./db.js";
import { getViews } from "./youtube.js";
import { captureProof } from "./proof.js"; // ✅ NEW

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
          async (err, last) => {

            const lastViews = last ? last.views : null;
            const count = lastViews ? data.views - lastViews : 0;

            const now = new Date();
            now.setSeconds(0, 0);

            const time = now.toLocaleTimeString("en-IN", {
              timeZone: "Asia/Kolkata",
              hour: "numeric",
              minute: "2-digit",
              second: "2-digit",
              hour12: true
            });

            // ✅ EXISTING LOGIC (UNCHANGED)
            db.run(
              "INSERT INTO views(videoId,time,views,count) VALUES(?,?,?,?)",
              [videoId, time, data.views, count]
            );

            io.emit("viewUpdate", { videoId, time, views: data.views, count });

            // ===========================
            // 🔥 NEW PROOF LOGIC (SAFE ADD)
            // ===========================

            db.all(
              "SELECT * FROM proof_schedule WHERE videoId=?",
              [videoId],
              async (err, schedules) => {

                const currentTime = now.toLocaleTimeString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true
                });

                for (const s of schedules) {

                  // ✅ FIX 1: safer time match (trim spaces)
                  if (s.time.trim() === currentTime.trim()) {

                    console.log("📸 Capturing proof for", videoId, currentTime);

                    try {
                      const proof = await captureProof(videoId, currentTime, data.views);

                      // ✅ SAVE proof
                      db.run(
                        "INSERT INTO proofs(videoId,time,views,imagePath) VALUES(?,?,?,?)",
                        [videoId, currentTime, data.views, proof.filePath]
                      );

                      // 🔥 FIX 2: DELETE schedule after capture (VERY IMPORTANT)
                      db.run(
                        "DELETE FROM proof_schedule WHERE id=?",
                        [s.id]
                      );

                    } catch (e) {
                      console.error("Proof capture failed:", e);
                    }

                  }
                }

              }
            );

          }
        );
      }
    });

    scheduleNextPoll();
  }

  function scheduleNextPoll() {
    const now = new Date();
    const msUntilNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
    setTimeout(pollData, msUntilNextMinute);
  }

  scheduleNextPoll();
}