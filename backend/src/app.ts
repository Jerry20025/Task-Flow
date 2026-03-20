import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { config } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";

const app = express();

// ── Security ─────────────────────────────────────────────────
app.use(helmet());
app.use(
    cors({
        origin: [
            config.clientUrl,
            "http://localhost:5174",
            "http://localhost:5173",
            "http://localhost:3000",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    })
);

// ── Body parsing ─────────────────────────────────────────────
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// ── Logging ──────────────────────────────────────────────────
if (config.nodeEnv === "development") {
    app.use(morgan("dev"));
}

// ── Static files (uploads) ───────────────────────────────────
app.use("/uploads", express.static(path.resolve(config.uploadDir)));

// ── Health check ─────────────────────────────────────────────
app.get("/api/v1/health", (_req, res) => {
    res.json({
        success: true,
        message: "JIRA Clone API is running 🚀",
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
    });
});

// ── API Routes ───────────────────────────────────────────────
app.use("/api/v1", routes);

// ── 404 handler ──────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Route not found.",
    });
});

// ── Global error handler ─────────────────────────────────────
app.use(errorHandler);

export default app;
