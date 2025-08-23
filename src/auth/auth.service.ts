import { eq } from "drizzle-orm";
import db from "../db/db.js";
import { authTable, usersTable, } from "../db/schema.js";
import { hashService } from "../util.js";

export const registerService = async(userData:any)=>{
return await db.transaction(async (tx) => {
    // 1. Create the user
    const [newUser] = await tx.insert(usersTable).values(userData).returning();
    const hashed_password = await hashService.hashPassword(userData.password);
    // 2. Create authentication record without PIN initially
    const [authRecord] = await tx.insert(authTable).values({
      user_id: newUser.id,
      password_hash: hashed_password,
      transaction_pin_hash: "", 
      pin_set: false,
    }).returning();
    
    return { user: newUser, auth: authRecord };
  });}


export const loginService = async(phone:string, password:string)=>{
    const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.phone,phone),
        with: { auth: true }
    })
    if(!user) throw new Error("User not found");
    const auth = user.auth;
    if(!auth) throw new Error("Authentication record not found");
    const passwordMatch = await hashService.verifyPassword(password, auth.password_hash);
    if(!passwordMatch){ 
        // increment login attempts max 3 before locking account for 15 minutes
        const attempts = (auth.login_attempts || 0) + 1;
        const lockUntil = attempts >= 3 ? new Date(Date.now() + 15 * 60 * 1000) : null;
        await db.update(authTable).set({ login_attempts: attempts, locked_until: lockUntil }).where(eq(authTable.id, auth.id));
        throw new Error("Invalid password");
    }
    // how to update last login
    await db.update(authTable).set({ last_login: new Date(), login_attempts: 0, locked_until: null }).where(eq(authTable.id, auth.id));
    return { user, auth };
}