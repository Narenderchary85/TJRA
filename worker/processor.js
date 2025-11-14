import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const QUEUE_NAME = process.env.QUEUE_NAME || "events_queue";
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "1000", 10);
const POLL_MS = parseInt(process.env.POLL_MS || "200", 10); 

async function start() {
  await mongoose.connect(process.env.MONGO_URL);
  const db = mongoose.connection.db;

  const queue = db.collection(QUEUE_NAME);
  const events = db.collection("events");

  console.log("Worker running (Atlas Mode)...");

  async function processBatch() {

    const docs = await queue.find().limit(BATCH_SIZE).toArray();

    if (docs.length === 0) return;

    try {
      await events.insertMany(docs, { ordered: false });
      const ids = docs.map(d => d._id);
      await queue.deleteMany({ _id: { $in: ids } });

      console.log(`Processed batch → ${docs.length} events`);
    } catch (err) {
      console.error("Batch processing error:", err);
    }
  }

  setInterval(processBatch, POLL_MS);
}

start();
