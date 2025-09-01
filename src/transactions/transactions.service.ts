import db from "../db/db.js";
import { depositTable } from "../db/schema.js";
import { eq } from "drizzle-orm";

// Define valid deposit status types for type safety
type DepositStatus = 'pending' | 'confirmed' | 'rejected';

export const transactionDepositService = async(userId: string, amount: number, reference: string) => {
    const deposit = await db.insert(depositTable).values({
        user_id: userId,
        reference,
        status: 'pending'
    });
    return deposit;
}

export const transactionGetDepositsService = async (filter: { status?: string }) => {
    // Validate status filter to ensure it's a valid enum value
    const isValidStatus = (status: string): status is DepositStatus => {
        return ['pending', 'confirmed', 'rejected'].includes(status);
    };

    if (filter.status) {
        // Validate that the status is one of the allowed enum values
        if (!isValidStatus(filter.status)) {
            throw new Error(`Invalid status filter. Must be one of: pending, confirmed, rejected`);
        }

        // If a status filter is provided, fetch deposits matching that status
        const deposits = await db.query.depositTable.findMany({
            where: eq(depositTable.status, filter.status), 
            orderBy: (deposits, { desc }) => [desc(deposits.created_at)],
        });
        return deposits;
    }

    // This will return all deposits if no status filter is provided
    const deposits = await db.query.depositTable.findMany({
        orderBy: (deposits, { desc }) => [desc(deposits.created_at)],
    });

    // Return the deposits (could be an empty array)
    return deposits;
}