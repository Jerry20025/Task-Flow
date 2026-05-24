
import fs from "fs";
import path from "path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma Studio may run from a different working directory, so load backend/.env explicitly.
const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "backend", ".env"),
  path.resolve(__dirname, ".env"),
  path.resolve(__dirname, "..", ".env"),
];

for (const p of envCandidates) {
  if (fs.existsSync(p)) {
    loadEnv({ path: p });
    break;
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  // Prisma 7.5 expects `datasource` to contain `url` and optional `shadowDatabaseUrl`.
  datasource: {
    url: process.env.DATABASE_URL!,
    shadowDatabaseUrl: process.env.DIRECT_URL,
  },
  migrations: {
    path: "prisma/migrations",
  },
});