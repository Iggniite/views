import db from './db.js';
import { getViews } from './youtube.js';

db.all("SELECT videoId FROM videos WHERE title IS NULL", async (err, rows) => {
    if (!rows || rows.length === 0) {
        console.log("No missing titles found.");
        return;
    }
    for (const r of rows) {
        console.log("Fetching metadata for:", r.videoId);
        const data = await getViews(r.videoId);
        if (data) {
            db.run("UPDATE videos SET title = ?, thumbnail = ? WHERE videoId = ?", [data.title, data.thumbnail, r.videoId], (updateErr) => {
                if (updateErr) console.error("Update error:", updateErr);
                else console.log("Updated", r.videoId);
            });
        }
    }
    setTimeout(() => process.exit(0), 2000); // Give SQLite time to complete
});
