import type { Context } from "hono";
import { allUsersAdmin, changeUserStatusService } from "./admin.service.js";

export const allUsersAdminController = async (c: Context) => {
    try {
        const users = await allUsersAdmin()
        return c.json({message: 'All users fetched successfully', users}, 200)
    } catch (error: any) {
        console.error('Error fetching users:', error);
        return c.json({message: (error as Error).message}, 500);
    }
}

export const changeUserStatusController = async (c: Context) => {
    const { id } = c.req.param();
    const { status } = await c.req.json();
    if (!id || !status) {
        return c.json({ message: 'User ID and status are required' }, 400);
    }
    try {
        await changeUserStatusService(id, status);
        return c.json({ message: `User status changed to ${status} successfully` }, 200);
    } catch (error: any) {
        console.error('Error changing user status:', error);
        return c.json({ message: (error as Error).message }, 500);
    }
}