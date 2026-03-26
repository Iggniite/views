import db from "./db.js";
import { getViews } from "./youtube.js";
import { captureProof } from "./proof.js";

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

            // ✅ ORIGINAL LOGIC (UNCHANGED)
            db.run(
              "INSERT INTO views(videoId,time,views,count) VALUES(?,?,?,?)",
              [videoId, time, data.views, count]
            );

            io.emit("viewUpdate", { videoId, time, views: data.views, count });

            // =====================================
            // 🔥 FIXED PROOF LOGIC
            // =====================================

            db.all(
              "SELECT * FROM proof_schedule WHERE videoId=?",
              [videoId],
              async (err, schedules) => {

                const currentMinutes = now.getHours() * 60 + now.getMinutes();

                for (const s of schedules) {

                  // convert scheduled time → minutes
                  const [timeStr, meridian] = s.time.split(" ");
                  let [hours, minutes] = timeStr.split(":").map(Number);

                  if (meridian === "PM" && hours !== 12) hours += 12;
                  if (meridian === "AM" && hours === 12) hours = 0;

                  const scheduledMinutes = hours * 60 + minutes;

                  // ✅ allow ±1 minute window
                  if (Math.abs(currentMinutes - scheduledMinutes) <= 1) {

                    console.log("📸 Capturing proof:", videoId, s.time);

                    try {
                      const proof = await captureProof(videoId, s.time, data.views);

                      // ✅ SAVE
                      db.run(
                        "INSERT INTO proofs(videoId,time,views,imagePath) VALUES(?,?,?,?)",
                        [videoId, s.time, data.views, proof.filePath]
                      );

                      // ✅ DELETE SCHEDULE (VERY IMPORTANT)
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