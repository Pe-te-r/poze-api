import { eq, sql } from "drizzle-orm";
import db from "../db/db.js";
import { authTable, pinAuditTable, pinTable, referralClaimTable, userReferralTable, usersTable, } from "../db/schema.js";
import { hashService } from "../helpers/hashService.js";
import { authTokenService } from "../helpers/tokenService.js";
import { generateRandomCode } from "../helpers/middleware.js";
export const registerService = async (userData) => {
    console.log('userData is:', userData);
    const phone_exits = await db.query.usersTable.findFirst({
        where: eq(usersTable.phone, userData.phone)
    });
    if (phone_exits)
        throw new Error("Phone number already registered");
    return await db.transaction(async (tx) => {
        // 1. Create the user
        const [newUser] = await tx.insert(usersTable).values(userData).returning();
        const hashed_password = await hashService.hashPassword(userData.password);
        // 2. Create authentication record without PIN initially
        const [authRecord] = await tx.insert(authTable).values({
            user_id: newUser.id,
            password_hash: hashed_password,
        }).returning();
        // 3. Create empty PIN record
        await tx.insert(pinTable).values({
            user_id: newUser.id,
            transaction_pin_hash: null,
            pin_set: false,
            pin_attempts: 0,
            pin_locked_until: null,
        });
        // 4. Create referral code for the new user
        const referralCode = generateRandomCode();
        await tx.insert(userReferralTable).values({
            user_id: newUser.id,
            referral_code: referralCode,
        });
        // 5. Optionally, record if referral code is provided
        const userReferrer = await tx.query.userReferralTable.findFirst({
            where: eq(userReferralTable.referral_code, userData.invitation_code)
        });
        if (userData.invitation_code && userReferrer) {
            await tx.insert(referralClaimTable).values({
                referrer_id: userReferrer.user_id,
                referee_id: newUser.id,
                referral_code: userData.invitation_code,
                status: 'pending',
                expires_at: sql `NOW() + INTERVAL '7 days'`,
            });
            await tx.update(userReferralTable).set({
                total_referrals: sql `${userReferralTable.total_referrals} + 1`
            }).where(eq(userReferralTable.user_id, userReferrer.user_id));
        }
    });
};
export const loginService = async (phone, password) => {
    const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.phone, phone),
        with: { auth: true }
    });
    if (!user)
        throw new Error("User not found");
    if (user.status !== 'active')
        throw new Error(`User account is ${user.status}`);
    // check if login attempts exceeded
    if (user.auth?.locked_until && user.auth.locked_until > new Date()) {
        const minutesRemaining = Math.ceil((user.auth.locked_until.getTime() - new Date().getTime()) / 1000 / 60);
        throw new Error(`Account locked due to multiple failed login attempts. Try again in ${minutesRemaining} minutes.`);
    }
    const auth = user.auth;
    if (!auth)
        throw new Error("Authentication record not found");
    const passwordMatch = await hashService.verifyPassword(password, auth.password_hash);
    if (!passwordMatch) {
        const attempts = (auth.login_attempts || 0) + 1;
        const lockUntil = attempts >= 3 ? new Date(Date.now() + 15 * 60 * 1000) : null;
        await db.update(authTable).set({ login_attempts: attempts, locked_until: lockUntil }).where(eq(authTable.id, auth.id));
        throw new Error("Invalid password");
    }
    // get tokens
    if (!user.phone || !user.role || !user.id) {
        throw new Error("User record is missing required fields for token generation.");
    }
    const { accessToken, refreshToken } = authTokenService.generateAuthTokens(user.phone, user?.role, user.id);
    await db.update(authTable).set({ last_login: new Date(), login_attempts: 0, locked_until: null }).where(eq(authTable.id, auth.id));
    return {
        userId: user.id,
        role: user.role,
        tokens: {
            accessToken,
            refreshToken
        }
    };
};
export const setPinService = async (userId, pin) => {
    const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, userId),
        with: { pin: true }
    });
    if (!user)
        throw new Error("User not found");
    if (user.pin?.pin_set)
        throw new Error("PIN already set. Use change PIN instead.");
    const updatedPin = await hashService.hashPin(pin);
    await db.update(pinTable).set({
        transaction_pin_hash: updatedPin,
        pin_set: true,
        pin_attempts: 0,
        pin_locked_until: null,
    }).where(eq(pinTable.user_id, userId));
    // record in audit table can be added here
    await db.insert(pinAuditTable).values({
        user_id: userId,
        action_type: 'created',
        reason: 'Initial PIN set'
    });
    return { message: "PIN set successfully" };
};
export const updatePinService = async (userId, newPin, reason = 'User changed the password') => {
    const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, userId),
        with: { pin: true }
    });
    if (!user)
        throw new Error("User not found");
    if (!user.pin?.pin_set)
        throw new Error("PIN not set. Use set PIN first.");
    const updatedPin = await hashService.hashPin(newPin);
    await db.update(pinTable).set({
        transaction_pin_hash: updatedPin,
        pin_attempts: 0,
        pin_locked_until: null,
    }).where(eq(pinTable.user_id, userId));
    // record in audit table can be added here
    await db.insert(pinAuditTable).values({
        user_id: userId,
        action_type: 'changed',
        reason
    });
    return { message: "PIN updated successfully" };
};
export const changePasswordService = async (userId, currentPassword, newPassword) => {
    const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, userId),
        with: { auth: true }
    });
    if (!user)
        throw new Error("User not found");
    const auth = user.auth;
    if (!auth)
        throw new Error("Authentication record not found");
    const passwordMatch = await hashService.verifyPassword(currentPassword, auth.password_hash);
    if (!passwordMatch)
        throw new Error("Current password is incorrect");
    const newHashedPassword = await hashService.hashPassword(newPassword);
    await db.update(authTable).set({ password_hash: newHashedPassword }).where(eq(authTable.id, auth.id));
    return { message: "Password changed successfully" };
};
