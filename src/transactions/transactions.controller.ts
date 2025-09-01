import type { Context } from "hono";
import { transactionDepositService, transactionGetDepositsService } from "./transactions.service.js";

export const transactionsDepositController = async(c:Context)=>{
    try {
        const { userId, amount, reference } = await c.req.json();
        if(!userId || !amount || !reference) {
            return c.json({message: "Missing required fields"}, 400);
        }
        await transactionDepositService(userId, amount, reference);
        return c.json({message: "Deposit initiated wait for admin approval"}, 201);
    } catch (error: any) {
        console.error("Error processing deposit:", error);
        return c.json({message: error.message}, 500);
    }
}

export const transactionsGetDepositsController = async(c:Context)=>{
    try {
        const { status } = c.req.query();
        const deposits = await transactionGetDepositsService({ status });
        return c.json({message:'deposits', data: deposits}, 200);
    } catch (error: any) {
        console.error("Error fetching deposits:", error);
        return c.json({message: error.message}, 500);
    }
}