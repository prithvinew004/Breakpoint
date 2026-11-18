import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { defineConfig, env } from "prisma/config";

const localEnvironment = fileURLToPath(new URL(".env.local", import.meta.url));

if (existsSync(localEnvironment)) {
  loadEnvFile(localEnvironment);
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
