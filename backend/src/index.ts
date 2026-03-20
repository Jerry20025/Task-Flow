import app from "./app";
import { config } from "./config/env";
import prisma from "./lib/prisma";

const startServer = async () => {
    try {
        // Test database connection
        await prisma.$connect();
        console.log("✅ Database connected successfully");

        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port} | env: ${config.nodeEnv} | base: /api/v1`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
    console.log("\n🛑 Shutting down gracefully...");
    await prisma.$disconnect();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("\n🛑 Shutting down gracefully...");
    await prisma.$disconnect();
    process.exit(0);
});

startServer();
