import db from "../db/db.js";
import { usersTable, authTable, pinTable, userReferralTable, referralClaimTable } from "../db/schema.js";
import { eq, count, and } from "drizzle-orm";

// Helper function to mask phone number for privacy
const maskPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    
    // For phone numbers like +1234567890 or 1234567890
    // Show first 5 and last 2 digits: +12345****90 or 12345****90
    if (phone.length >= 7) {
        const start = phone.substring(0, 5);
        const end = phone.substring(phone.length - 2);
        const masked = '*'.repeat(Math.max(phone.length - 7, 4));
        return `${start}${masked}${end}`;
    }
    
    // For shorter numbers, mask middle part
    return phone.substring(0, 1) + '*'.repeat(phone.length - 2) + phone.substring(phone.length - 1);
};

export const getDashboardByIdService = async (userId: string) => {
    try {
        // Get user basic info (excluding sensitive data)
        const userInfo = await db
            .select({
                id: usersTable.id,
                first_name: usersTable.first_name,
                phone: usersTable.phone,
                phone_verified: usersTable.phone_verified,
                role: usersTable.role,
                avatar_url: usersTable.avatar_url,
                status: usersTable.status,
                created_at: usersTable.created_at
            })
            .from(usersTable)
            .where(eq(usersTable.id, userId))
            .limit(1);

        if (!userInfo.length) {
            return null;
        }

        const user = userInfo[0];

        // Get auth status (excluding sensitive data like password_hash, tokens)
        const authInfo = await db
            .select({
                login_attempts: authTable.login_attempts,
                last_login: authTable.last_login,
                locked_until: authTable.locked_until,
            })
            .from(authTable)
            .where(eq(authTable.user_id, userId))
            .limit(1);

        // Get PIN status (excluding sensitive PIN hash)
        const pinInfo = await db
            .select({
                pin_set: pinTable.pin_set,
                pin_attempts: pinTable.pin_attempts,
                pin_locked_until: pinTable.pin_locked_until,
            })
            .from(pinTable)
            .where(eq(pinTable.user_id, userId))
            .limit(1);

        // Get user's referral code and stats
        const referralInfo = await db
            .select({
                referral_code: userReferralTable.referral_code,
                total_referrals: userReferralTable.total_referrals,
                total_earnings: userReferralTable.total_earnings,
                is_active: userReferralTable.is_active,
                updated_at: userReferralTable.updated_at
            })
            .from(userReferralTable)
            .where(eq(userReferralTable.user_id, userId))
            .limit(1);

        // Get referral claim statistics (count by status)
        const pendingClaims = await db
            .select({ count: count() })
            .from(referralClaimTable)
            .where(and(
                eq(referralClaimTable.referrer_id, userId),
                eq(referralClaimTable.status, 'pending')
            ));

        const claimedClaims = await db
            .select({ count: count() })
            .from(referralClaimTable)
            .where(and(
                eq(referralClaimTable.referrer_id, userId),
                eq(referralClaimTable.status, 'claimed')
            ));

        const expiredClaims = await db
            .select({ count: count() })
            .from(referralClaimTable)
            .where(and(
                eq(referralClaimTable.referrer_id, userId),
                eq(referralClaimTable.status, 'expired')
            ));

        // Get recent referral claims (last 5) with referee details
        const recentReferrals = await db
            .select({
                id: referralClaimTable.id,
                referee_id: referralClaimTable.referee_id,
                referral_code: referralClaimTable.referral_code,
                status: referralClaimTable.status,
                expires_at: referralClaimTable.expires_at,
                claimed_at: referralClaimTable.claimed_at,
                referee_first_name: usersTable.first_name,
                referee_phone: usersTable.phone
            })
            .from(referralClaimTable)
            .innerJoin(usersTable, eq(referralClaimTable.referee_id, usersTable.id))
            .where(eq(referralClaimTable.referrer_id, userId))
            .limit(5);

        // Calculate dashboard metrics
        const pendingCount = pendingClaims[0]?.count || 0;
        const claimedCount = claimedClaims[0]?.count || 0;
        const expiredCount = expiredClaims[0]?.count || 0;

        return {
            user: {
                id: user.id,
                first_name: user.first_name,
                phone: user.phone,
                phone_verified: user.phone_verified,
                role: user.role,
                avatar_url: user.avatar_url,
                status: user.status,
                member_since: user.created_at
            },
            security: {
                login_attempts: authInfo[0]?.login_attempts || 0,
                last_login: authInfo[0]?.last_login,
                account_locked: authInfo[0]?.locked_until ? new Date() < new Date(authInfo[0].locked_until) : false,
                pin_set: pinInfo[0]?.pin_set || false,
                pin_locked: pinInfo[0]?.pin_locked_until ? new Date() < new Date(pinInfo[0].pin_locked_until) : false
            },
            referral: {
                code: referralInfo[0]?.referral_code || null,
                is_active: referralInfo[0]?.is_active || false,
                total_referrals: referralInfo[0]?.total_referrals || 0,
                total_earnings: referralInfo[0]?.total_earnings || 0, // in cents
                total_earnings_formatted: `$${((referralInfo[0]?.total_earnings || 0) / 100).toFixed(2)}`,
                last_updated: referralInfo[0]?.updated_at
            },
            referral_statistics: {
                pending_claims: pendingCount,
                claimed_referrals: claimedCount,
                expired_claims: expiredCount,
                total_claims: pendingCount + claimedCount + expiredCount,
                recent_referrals: recentReferrals.map(ref => ({
                    id: ref.id,
                    referee_id: ref.referee_id,
                    referee_first_name: ref.referee_first_name,
                    referee_phone_partial: maskPhoneNumber(ref.referee_phone),
                    referral_code_used: ref.referral_code,
                    status: ref.status,
                    expires_at: ref.expires_at,
                    claimed_at: ref.claimed_at,
                    days_to_expire: ref.expires_at ? Math.ceil((new Date(ref.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null,
                    is_expired: ref.expires_at ? new Date() > new Date(ref.expires_at) : false
                }))
            },
            summary: {
                account_status: user.status,
                verification_complete: user.phone_verified,
                security_setup_complete: (pinInfo[0]?.pin_set || false),
                referral_program_active: referralInfo[0]?.is_active || false,
                total_network_size: referralInfo[0]?.total_referrals || 0,
                lifetime_earnings: `$${((referralInfo[0]?.total_earnings || 0) / 100).toFixed(2)}`,
                active_referral_code: referralInfo[0]?.referral_code || null
            }
        };

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw new Error('Failed to fetch dashboard data');
    }
};
