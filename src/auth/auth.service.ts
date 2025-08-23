import { eq } from "drizzle-orm";
import db from "../db/db.js";
import { authTable, pinManageTable, usersTable, } from "../db/schema.js";
import { hashService } from "../helpers/hashService.js";
import { authTokenService } from "../helpers/tokenService.js";

export const registerService = async(userData:any)=>{
return await db.transaction(async (tx) => {
    // 1. Create the user
    const [newUser] = await tx.insert(usersTable).values(userData).returning();
    const hashed_password = await hashService.hashPassword(userData.password);
    // 2. Create authentication record without PIN initially
    const [authRecord] = await tx.insert(authTable).values({
      user_id: newUser.id,
      password_hash: hashed_password,
    }).returning();
    
    return { user: newUser, auth: authRecord };
  });}


export const loginService = async(phone:string, password:string)=>{
    const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.phone,phone),
        with: { auth: true }
    })
    if(!user) throw new Error("User not found");
    // check if login attempts exceeded
    if(user.auth?.locked_until && user.auth.locked_until > new Date()){
        throw new Error("Account locked due to multiple failed login attempts. Try again later.");
    }
    const auth = user.auth;
    if(!auth) throw new Error("Authentication record not found");
    const passwordMatch = await hashService.verifyPassword(password, auth.password_hash);
    if(!passwordMatch){ 
        const attempts = (auth.login_attempts || 0) + 1;
        const lockUntil = attempts >= 3 ? new Date(Date.now() + 15 * 60 * 1000) : null;
        await db.update(authTable).set({ login_attempts: attempts, locked_until: lockUntil }).where(eq(authTable.id, auth.id));
        throw new Error("Invalid password");
    }
    // get tokens
    if (!user.phone || !user.role || !user.id) {
        throw new Error("User record is missing required fields for token generation.");
    }
    const {accessToken,refreshToken} = authTokenService.generateAuthTokens(user.phone, user?.role, user.id);
    await db.update(authTable).set({ last_login: new Date(), login_attempts: 0, locked_until: null }).where(eq(authTable.id, auth.id));
    return {
        userId: user.id,
        role: user.role, 
        tokens: {
            accessToken, 
            refreshToken
        }
    };
}


export const setPinService = async(userId:string, pin:string)=>{
    const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id,userId),
        with: { auth: true, pinHistory: true }
    });
    if(!user) throw new Error("User not found");
    const auth = user.auth;
    const updatedPin = await hashService.hashPin(pin);
    await db.update(pinManageTable).set({
        transaction_pin_hash: updatedPin,
        pin_set: true,
        pin_attempts: 0,
        pin_locked_until: null,
        changed_at: new Date(),
        changed_by: 'user',
        reason: 'Initial PIN set'
    }).where(eq(pinManageTable.user_id, userId));
}