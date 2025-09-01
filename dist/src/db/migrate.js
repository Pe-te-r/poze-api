import "dotenv/config";
import { migrate } from "drizzle-orm/neon-http/migrator";
import db from "./db.js";
async function migration() {
    try {
        console.log("======== Migrations started ========");
        await migrate(db, { migrationsFolder: "./drizzle" });
        console.log("======== Migrations ended ========");
    }
    catch (err) {
        console.error('Error during migration:');
        console.error(err);
    }
    finally {
        process.exit(0);
    }
}
migration().catch((err) => {
    console.error(err);
    process.exit(1);
});
