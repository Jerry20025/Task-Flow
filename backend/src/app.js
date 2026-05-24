"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var cookie_parser_1 = require("cookie-parser");
var helmet_1 = require("helmet");
var morgan_1 = require("morgan");
var path_1 = require("path");
var env_1 = require("./config/env");
var errorHandler_1 = require("./middleware/errorHandler");
var routes_1 = require("./routes");
var app = (0, express_1.default)();
// ── Security ─────────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: [
        env_1.config.clientUrl,
        "http://localhost:5174",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
}));
// ── Body parsing ─────────────────────────────────────────────
app.use(express_1.default.json({ limit: "16kb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "16kb" }));
app.use((0, cookie_parser_1.default)());
// ── Logging ──────────────────────────────────────────────────
if (env_1.config.nodeEnv === "development") {
    app.use((0, morgan_1.default)("dev"));
}
// ── Static files (uploads) ───────────────────────────────────
app.use("/uploads", express_1.default.static(path_1.default.resolve(env_1.config.uploadDir)));
// ── Health check ─────────────────────────────────────────────
app.get("/api/v1/health", function (_req, res) {
    res.json({
        success: true,
        message: "JIRA Clone API is running 🚀",
        timestamp: new Date().toISOString(),
        environment: env_1.config.nodeEnv,
    });
});
// ── API Routes ───────────────────────────────────────────────
app.use("/api/v1", routes_1.default);
// ── 404 handler ──────────────────────────────────────────────
app.use(function (_req, res) {
    res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Route not found.",
    });
});
// ── Global error handler ─────────────────────────────────────
app.use(errorHandler_1.errorHandler);
exports.default = app;
