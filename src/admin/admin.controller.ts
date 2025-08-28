import type { Context } from "hono";
import { allUsersAdmin } from "./admin.service.js";

export const allUsersAdminController = async (c: Context) => {
    try {
        const users = await allUsersAdmin()
        return c.json({message: 'All users fetched successfully', users}, 200)
    } catch (error: any) {
        console.error('Error fetching users:', error);
        return c.json({message: (error as Error).message}, 500);
    }
}
