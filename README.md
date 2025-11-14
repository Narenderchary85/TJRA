Architecture Overview
1. Architecture Decision

To support scalable, non-blocking analytics ingestion, the system uses:

(A) API Server

Exposes endpoints:

POST /event → stores the event into a lightweight queue collection

GET /stats → returns aggregated analytics

Does not process events directly → keeps API fast

(B) Background Worker

Runs in parallel

Polls events_queue at intervals (e.g., 200ms)

Reads batch of events → inserts into events collection

Deletes processed queue entries

Allows heavy work to run outside the request lifecycle

Why this Architecture?

✔ Non-blocking API (fast responses)

✔ Handles high traffic easily

✔ Works on MongoDB Atlas free tier (avoids tailable cursors)

✔ Easy horizontal scaling (API and worker run separately)

✔ No need for Kafka/Redis (simple, lightweight design)

2. Database Schema
A) events_queue (temporary queue)

Stores incoming analytics events:

Field	Type	Description
_id	ObjectId	Unique ID
site_id	String	Website/app identifier
event_type	String	page_view, click, etc.
path	String	URL path
user_id	String	User identifier
timestamp	Date	Event time
ingested_at	Date	Added to queue
B) events (final processed events)
Field	Type
All fields from queue	
processed_at	Date

Worker inserts data here after batching.

3. Installation and Setup
Backend (Analytics API + Worker)
1. Clone the Repository
git clone https://github.com/Narenderchary85/analytics_service
cd analytics_service

2. Install Dependencies
npm install

3. Environment Variables Setup

Create a .env file:

PORT=1000
MONGO_URL=mongodb://localhost:27017/analytics_db
QUEUE_NAME=events_queue
BATCH_SIZE=1000
POLL_MS=200


If using MongoDB Atlas:

MONGO_URL="mongodb+srv://USER:PASSWORD@cluster.mongodb.net/analytics"

4. Start the API Server
npm run dev


The backend will run on:

http://localhost:1000

5. Start the Worker

In another terminal:

npm run worker


You will see:

Worker running...
Queue Ready
Processing batch...

4. API Usage
A) POST /event — Submit an event
cURL Example
curl -X POST http://localhost:1000/event \
-H "Content-Type: application/json" \
-d '{
  "site_id": "site-001",
  "event_type": "page_view",
  "path": "/home",
  "user_id": "user123"
}'


Response:

{ "status": "queued" }

B) GET /stats — View aggregated analytics
cURL Example
curl "http://localhost:1000/stats?site_id=site-001"


Response Example:

{
  "total_events": 1200,
  "unique_users": 45,
  "top_paths": [
    { "path": "/home", "count": 850 },
    { "path": "/pricing", "count": 200 }
  ]
}

5. Recommended MongoDB Indexes

Run these for faster analytics:

db.events.createIndex({ site_id: 1 });
db.events.createIndex({ site_id: 1, timestamp: 1 });
db.events.createIndex({ site_id: 1, path: 1 });
db.events.createIndex({ timestamp: 1 });

6. Project Structure
analytics_service/
│── server.js
│── worker/
│     └── processor.js
│── models/
│── routes/
│── utils/
│── package.json
│── README.md
└── .env