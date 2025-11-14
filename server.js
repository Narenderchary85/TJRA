import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import EventRoute from "./routes/EventRoute.js";
import StatsRoute from "./routes/StatsRoute.js";

import { ensureQueue } from "./queue/createQueue.js";

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT || 1000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URL, { autoIndex: false })
  .then(async () => {
    console.log('DB connected');
    await ensureQueue(mongoose.connection.db);
    console.log('Queue Ready');
  })
  .catch(err => console.error(err));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workerPath = path.join(__dirname, "worker", "processor.js");

console.log("Starting background worker");

const worker = spawn("node", [workerPath], { stdio: "inherit" });

worker.on("exit", (code) => {
  console.log(`Worker exited with code ${code}, restarting`);
  spawn("node", [workerPath], { stdio: "inherit" });
});

app.use("/event", EventRoute);
app.use("/stats", StatsRoute);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
