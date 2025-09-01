import db from "../db/db.js";
import { depositTable } from "../db/schema.js";

export const transactionDepositService  = async(userId:string, amount:number, reference:string)=>{
    const deposit = await db.insert(depositTable).values({
        user_id: userId,
        reference,
        status: 'pending'
    })
    return deposit;
}

export const transactionGetDepositsService = async(filter:{ status?: string })=>{
    const whereClause: any = {};
    if(filter.status){
        whereClause.status = filter.status;
    }
    const deposits = await db.query.depositTable.findMany({
        where: whereClause,
        orderBy: (deposits, { desc }) => [desc(deposits.created_at)],
    });
    if(!deposits) throw new Error("No deposits found");
    return deposits;
}   