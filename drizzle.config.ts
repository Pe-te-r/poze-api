import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",   
    schema: "./src/db/schema.ts",
    out: "./src/db/migrations",
    dbCredentials: {
        url: process.env.Database_URL as string,
    },
    verbose: true,
    strict: true,

}) 