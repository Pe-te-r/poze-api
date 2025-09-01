import { transactionDepositService, transactionGetDepositsService } from "./transactions.service.js";
export const transactionsDepositController = async (c) => {
    try {
        const { userId, amount, reference } = await c.req.json();
        if (!userId || !reference) {
            return c.json({ message: "Missing required fields" }, 400);
        }
        await transactionDepositService(userId, amount, reference);
        return c.json({ message: "Deposit initiated wait for admin approval" }, 201);
    }
    catch (error) {
        console.error("Error processing deposit:", error);
        return c.json({ message: error.message }, 500);
    }
};
export const transactionsGetDepositsController = async (c) => {
    try {
        const status = c.req.query('status');
        console.log("Fetching deposits with status:", status);
        const deposits = await transactionGetDepositsService({ status });
        console.log(deposits);
        return c.json({ message: 'deposits', data: deposits }, 200);
    }
    catch (error) {
        console.error("Error fetching deposits:", error);
        return c.json({ message: error.message }, 500);
    }
};
