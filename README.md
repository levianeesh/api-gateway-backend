Developer API Gateway & Webhook Engine
A robust B2B Developer API Gateway built on the MERN stack. This system manages third-party integrations, secure routing, and real-time asynchronous webhook dispatching. It includes a comprehensive React developer portal for API key lifecycle management, webhook registration, and real-time API traffic visualization.

Key Features
Cryptographic Authentication: Secure API key generation using SHA-256 hashing. The system stores only hashed keys in the database while providing the developer with a one-time raw key display.

API Gateway & Rate Limiting: Custom Express middleware that intercepts incoming requests, validates x-api-key headers, and enforces Token Bucket rate limiting to protect backend services from DDoS abuse.

Asynchronous Webhook Engine: Event-driven architecture that triggers background workers to find registered developer webhook URLs, digitally sign payloads using HMAC SHA-256, and dispatch them reliably via Axios.

Developer Portal: A secure React application authenticated via JWT, featuring API key rolling, endpoint configuration, and interactive data visualization of API response times.

Tech Stack
Frontend: React (Vite), React Router, Axios, Recharts

Backend: Node.js, Express.js

Database: MongoDB, Mongoose

Security & Utilities: crypto, jsonwebtoken, bcrypt, express-rate-limit

System Architecture
1. The Gateway (Traffic Control)
External requests hit the gateway layer where the x-api-key is extracted. The raw key is hashed and securely compared against the active keys in MongoDB. Authorized requests pass through the rate limiter (configured for window-based throttling) before reaching the protected mock endpoints.

2. The Webhook Dispatcher (Background Processing)
Upon successful transaction processing, the server immediately responds to the client, preventing latency. In the background, the dispatcher fetches the developer's registered webhook URLs, signs the JSON payload with a unique whsec_ secret, and issues asynchronous POST requests to the external servers.

3. The Analytics Engine
Every authenticated request is logged with its precise millisecond execution time. The React dashboard fetches this time-series data and visualizes it using Recharts, allowing developers to monitor their API integration performance.

Getting Started
Prerequisites
Node.js (v18+)

MongoDB Atlas account (or local MongoDB server)

Installation
1.Clone the repository

```bash
git clone https://github.com/yourusername/api-gateway-backend.git
cd api-gateway-backend
```
2.Install Backend Dependencies

```bash
npm install
```
3.Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```
4.Environment Configuration
Create a .env file in the root directory and add the following variables:

```Code snippet
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/gateway_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_cryptographic_string
```
5.Start the Development Servers
Open two terminal windows.

Terminal 1 (Backend):

```Bash
npm run dev
```
Terminal 2 (Frontend):

```Bash
cd frontend
npm run dev
```
API Reference

Internal Dashboard APIs (Requires JWT Bearer Token)
POST /auth/register - Register a new developer account

POST /auth/login - Authenticate and retrieve JWT

POST /api-keys/generate - Generate and return a new raw API key

GET /api-keys - Check active API key status

POST /webhooks/register - Register a destination URL for event dispatch

GET /webhooks - Retrieve all active webhook configurations

GET /analytics/logs - Fetch the most recent API request logs

External Gateway APIs (Requires x-api-key Header)
POST /v1/process-payment - Mock transaction route that triggers background webhooks

Security Implementation Notes

Zero-Knowledge API Keys: Raw API keys are never stored in the database. If a key is lost, the developer must roll their key via the dashboard.

Webhook Signature Verification: External developers can verify incoming webhooks by hashing the raw request body with their dashboard-provided whsec_ secret and comparing it to the x-webhook-signature header.
