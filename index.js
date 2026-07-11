import express from "express";   // Importing the Express framework
import mongoose from "mongoose";   // Importing Mongoose for MongoDB interactions
// Used to override DNS resolution when the current resolver cannot handle Atlas SRV lookups.
import dns from "node:dns";
import userRouter from "./routers/userRouter.js";
import authenticateUser from "./middlewares/authentication.js";
import productRouter from "./routers/productRouter.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();   // Load environment variables from .env file

const app = express();
const port = Number(process.env.PORT) || 3000;

// Allow the app to use explicitly configured DNS servers from the environment.
const dnsServers = (process.env.DNS_SERVERS || "")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

if (dnsServers.length > 0) {
    dns.setServers(dnsServers);
    console.log(`Using custom DNS servers: ${dnsServers.join(", ")}`);
} else {
    // Fall back to public DNS when Node is pointing at a local resolver that refuses SRV queries.
    const currentDnsServers = dns.getServers();
    const isLoopbackOnly =
        currentDnsServers.length > 0 &&
        currentDnsServers.every((server) => server === "127.0.0.1" || server === "::1");

    if (isLoopbackOnly) {
        const fallbackDnsServers = ["1.1.1.1", "8.8.8.8"];
        dns.setServers(fallbackDnsServers);
        console.warn(
            `Detected loopback DNS (${currentDnsServers.join(", ")}). Switched to fallback DNS: ${fallbackDnsServers.join(", ")}`
        );
    }
}

// Support a primary Atlas URI and an optional fallback URI for environments with strict network rules.
const mongoCandidates = [process.env.MONGO_URI, process.env.MONGO_URI_FALLBACK].filter(Boolean);
// Keep connection attempts bounded so startup fails quickly instead of hanging on DNS or network issues.
const mongoConnectTimeoutMs = Number(process.env.MONGO_CONNECT_TIMEOUT_MS) || 15000;
// Retry a few times before giving up to handle transient network or DNS failures.
const mongoRetryCount = Number(process.env.MONGO_RETRY_COUNT) || 3;
// Pause between retries so repeated failures do not hammer the network immediately.
const mongoRetryDelayMs = Number(process.env.MONGO_RETRY_DELAY_MS) || 2000;

// Small async delay helper used between MongoDB retry attempts.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectToMongo() {
    // Stop early if no MongoDB URI is configured.
    if (mongoCandidates.length === 0) {
        throw new Error("Missing MONGO_URI (or MONGO_URI_FALLBACK) in environment variables.");
    }

    let lastError;

    // Try each configured URI and retry each one before surfacing the last error.
    for (const uri of mongoCandidates) {
        for (let attempt = 1; attempt <= mongoRetryCount; attempt++) {
            try {
                await mongoose.connect(uri, {
                    serverSelectionTimeoutMS: mongoConnectTimeoutMs,
                    connectTimeoutMS: mongoConnectTimeoutMs,
                    socketTimeoutMS: 45000,
                    family: 4,
                });
                console.log("Connected to MongoDB");
                return;
            } catch (error) {
                lastError = error;
                console.error(
                    `MongoDB connection failed (attempt ${attempt}/${mongoRetryCount}): ${error.message}`
                );
                if (attempt < mongoRetryCount) {
                    await sleep(mongoRetryDelayMs);
                }
            }
        }
    }

    throw lastError;
}

app.use(cors());    // Middleware to enable CORS

app.use(express.json());    // Middleware to parse JSON bodies

app.use(authenticateUser);

app.use("/api/users", userRouter);
app.use("/api/products", productRouter)

// Delay listening until MongoDB is reachable so the server does not start in a broken state.
async function startServer() {
    try {
        await connectToMongo();
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

startServer();