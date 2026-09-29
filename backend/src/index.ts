import "dotenv/config";
import express from "express";
import http from "http"
import cors from "cors";
import helmet from "helmet";
import { Env } from "./config/env.config.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import routes from "./routes/index.js";
import { globalLimiter } from "./middlewares/rateLimiter.middleware.js";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";



const app = express();
const server = http.createServer(app);


app.use(cors({
    origin: Env.FRONTEND_ORIGIN,
    credentials: true
}));

app.use(helmet()); // Add security headers

app.use(
    clerkMiddleware({
        debug: true,
        clockSkewInMs: 60_000,
    })
);

app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json());
app.use(globalLimiter); //Rate Limiter
app.use("/api", routes);


// Error Handler
app.use(errorHandler);



server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${Env.PORT} is already in use`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});

server.listen(Env.PORT, async () => {
  try {
    await connectDB();
    console.log(`Server is listening on PORT ${Env.PORT}`);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
});

