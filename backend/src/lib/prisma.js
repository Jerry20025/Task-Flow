"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
var prisma_1 = require("../../generated/prisma");
var adapter_pg_1 = require("@prisma/adapter-pg");
var connectionString = process.env.DATABASE_URL;
var globalForPrisma = globalThis;
function createPrismaClient() {
    var adapter = new adapter_pg_1.PrismaPg({ connectionString: connectionString });
    return new prisma_1.PrismaClient({
        adapter: adapter,
        log: process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
    });
}
exports.prisma = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : createPrismaClient();
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = exports.prisma;
}
exports.default = exports.prisma;
