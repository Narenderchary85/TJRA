import express from "express";
import mongoose from "mongoose";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { site_id, date } = req.query;
    if (!site_id) return res.status(400).json({ message: "site_id required" });

    const events = mongoose.connection.db.collection("events");

    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const pipeline = [
      { $match: { site_id, timestamp: { $gte: start.toISOString(), $lt: end.toISOString() } } },
      {
        $group: {
          _id: "$path",
          views: { $sum: 1 },
          users: { $addToSet: "$user_id" }
        }
      },
      { $sort: { views: -1 } }
    ];

    const result = await events.aggregate(pipeline).toArray();

    res.json({
      site_id,
      date,
      total_views: result.reduce((a, b) => a + b.views, 0),
      unique_users: new Set(result.flatMap(r => r.users)).size,
      top_paths: result.map(r => ({ path: r._id, views: r.views }))
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Error fetching stats" });
  }
});

export default router;
