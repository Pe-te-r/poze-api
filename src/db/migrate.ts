import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import  db,{ client } from "./db.js";

async function migration() {
    try {
        console.log("======== Migrations started ========");
        await migrate(db, { migrationsFolder: __dirname + "/migrations" });
        await client.end();
        console.log("======== Migrations ended ========");
    } catch (err) {
        console.error('error creating');

        console.error(err);
    } finally {
        process.exit(0);
    }
}

migration().catch((err) => {
    console.error(err);
    process.exit(1);
});