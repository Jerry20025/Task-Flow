"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const prisma_1 = __importDefault(require("./lib/prisma"));
const startServer = async () => {
    try {
        // Test database connection
        await prisma_1.default.$connect();
        console.log("✅ Database connected successfully");
        app_1.default.listen(env_1.config.port, () => {
            console.log(`Server running on port ${env_1.config.port} | env: ${env_1.config.nodeEnv} | base: /api/v1`);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};
// Handle graceful shutdown
process.on("SIGINT", async () => {
    console.log("\n🛑 Shutting down gracefully...");
    await prisma_1.default.$disconnect();
    process.exit(0);
});
process.on("SIGTERM", async () => {
    console.log("\n🛑 Shutting down gracefully...");
    await prisma_1.default.$disconnect();
    process.exit(0);
});
startServer();
//# sourceMappingURL=index.js.map