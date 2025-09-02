// import "dotenv/config";
// import { Client } from "pg";
// import * as schema from "./schema.js"
// import { drizzle } from 'drizzle-orm/neon-http';



// export const client = new Client({
//     connectionString: process.env.DATABASE_URL as string,   //get the database url from the environment
// })

// const main = async () => {
//     await client.connect();  //connect to the database
// }
// main();


// const db = drizzle(client, { schema, logger: true })  //create a drizzle instance

// export default db;

import "dotenv/config";
// import { drizzle } from "drizzle-orm/neon-serverless";
// import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle } from "drizzle-orm/node-postgres";

// import { drizzle } from 'drizzle-orm/node-postgres';


import { neon } from "@neondatabase/serverless";
import * as schema from "./schema.js"
import { Pool } from "pg";
import postgres from 'postgres';

// export const client = postgres(process.env.DATABASE_URL as string, { ssl: 'require' });
export const client = neon(process.env.DATABASE_URL as string);

// export const client = new Pool({ connectionString: process.env.DATABASE_URL });

// const client = neon(process.env.DATABASE_URL as string);


// const db = drizzle(client, { schema, logger: true });
// export const client = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });
const db = drizzle({ client, schema, logger: true });



export default db;


