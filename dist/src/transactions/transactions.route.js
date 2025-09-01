import { Hono } from "hono";
import { transactionsDepositController, transactionsGetDepositsController } from "./transactions.controller.js";
export const transactionRoute = new Hono();
transactionRoute.post('/deposit', transactionsDepositController);
transactionRoute.get('/deposit', transactionsGetDepositsController);
transactionRoute.post('/withdraw');
// transactionRoute.
