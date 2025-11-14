import express from "express";
import mongoose from "mongoose";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { site_id, event_type, path, user_id, timestamp } = req.body;

    if (!site_id || !event_type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const queue = mongoose.connection.db.collection("events_queue");

    await queue.insertOne({
      site_id,
      event_type,
      path,
      user_id,
      timestamp: timestamp || new Date().toISOString()
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Event ingestion error:", err);
    return res.status(500).json({ message: "Error ingesting event" });
  }
});

export default router;
