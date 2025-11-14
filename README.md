Architecture Overview
1. Architecture

(A) API Server

Exposes endpoints:

POST /event → stores the event 

GET /stats → returns aggregated results

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
**1. Clone the Repository**
    ```bash
            git clone https://github.com/Narenderchary85/TJRA.git
            cd analytics_service

**2. Install Dependencies**
    ```bash
            npm install

**3. Environment Variables Setup**

**Create a .env file:**
    ```bash
            PORT=1000
            MONGO_URL=mongodb://localhost:27017/test_db
            QUEUE_NAME=events_queue
            BATCH_SIZE=1000
            POLL_MS=200


**If using MongoDB Atlas:**

MONGO_URL="mongodb+srv://USER:PASSWORD@cluster.mongodb.net/test_db"

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

**4. API Usage**
**A) POST /event — Submit an event**

    ```bash
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


**Response Example:**
 ```bash
            {
            "total_events": 1200,
            "unique_users": 45,
            "top_paths": [
                { "path": "/home", "count": 850 },
                { "path": "/pricing", "count": 200 }
            ]
            }


