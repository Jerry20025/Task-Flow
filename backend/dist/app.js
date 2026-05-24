"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
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
app.get("/api/v1/health", (_req, res) => {
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
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Route not found.",
    });
});
// ── Global error handler ─────────────────────────────────────
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map