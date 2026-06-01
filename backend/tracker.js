import db from "./db.js";
import { getViews } from "./youtube.js";
import { captureProof } from "./proof.js";

// 🔥 NEW: Prevent overlapping polls
let isPolling = false;

export function startTracker(io) {

  async function pollData() {

    // 🔥 NEW: Skip if previous poll still running
    if (isPolling) {
      console.log("⏳ Previous poll still running");
      scheduleNextPoll();
      return;
    }

    isPolling = true;

    try {

      // 🔥 FIXED: Only active videos
      db.all(
        "SELECT videoId FROM videos WHERE status='active'",
        async (err, rows) => {

          if (err) {
            console.error(err);
            return;
          }

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

                // =========================
                // ✅ ORIGINAL TIME (UNCHANGED)
                // =========================
                const now = new Date();
                now.setSeconds(0, 0);

                const time = now.toLocaleTimeString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true
                });

                // =========================
                // ✅ TRACK VIEWS
                // =========================
                db.run(
                  "INSERT INTO views(videoId,time,views,count) VALUES(?,?,?,?)",
                  [videoId, time, data.views, count]
                );

                io.emit("viewUpdate", {
                  videoId,
                  time,
                  views: data.views,
                  count
                });

                // =========================
                // 🔥 PROOF SYSTEM
                // =========================
                db.all(
                  "SELECT * FROM proof_schedule WHERE videoId=?",
                  [videoId],
                  async (err, schedules) => {

                    const parts = now.toLocaleTimeString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true
                    }).split(" ");

                    const [t, meridian] = parts;
                    let [h, m] = t.split(":").map(Number);

                    if (meridian === "PM" && h !== 12) h += 12;
                    if (meridian === "AM" && h === 12) h = 0;

                    const currentMinutes = h * 60 + m;

                    for (const s of schedules) {

                      const [timeStr, meridian2] = s.time.split(" ");
                      let [hours, minutes] = timeStr.split(":").map(Number);

                      if (meridian2 === "PM" && hours !== 12) hours += 12;
                      if (meridian2 === "AM" && hours === 12) hours = 0;

                      const scheduledMinutes = hours * 60 + minutes;

                      if (currentMinutes === scheduledMinutes) {

                        console.log("📸 Capturing proof:", videoId, s.time);

                        try {

                          const proof = await captureProof(
                            videoId,
                            s.time,
                            data.views
                          );

                          db.run(
                            "INSERT INTO proofs(videoId,time,views,imagePath) VALUES(?,?,?,?)",
                            [videoId, s.time, data.views, proof.filePath]
                          );

                          db.run(
                            "DELETE FROM proof_schedule WHERE id=?",
                            [s.id]
                          );

                          console.log("✅ Proof captured");

                        } catch (e) {
                          console.error("❌ Proof capture failed:", e);
                        }

                      }

                    }

                  }
                );

              }
            );
          }

        }
      );

    } catch (e) {
      console.error("Polling error:", e);
    }

    // 🔥 NEW: Release lock
    isPolling = false;

    scheduleNextPoll();
  }

  function scheduleNextPoll() {
    const now = new Date();

    const msUntilNextMinute =
      60000 - (now.getSeconds() * 1000 + now.getMilliseconds());

    setTimeout(pollData, msUntilNextMinute);
  }

  scheduleNextPoll();
}