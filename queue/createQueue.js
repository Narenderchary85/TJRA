export async function ensureQueue(db) {
  const collections = await db.listCollections().toArray();
  const exists = collections.some(c => c.name === "events_queue");

  if (!exists) {
    await db.createCollection("events_queue");
    console.log("Created events_queue");
  } else {
    console.log("Queue already exists");
  }
}
