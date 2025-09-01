import { allUsersAdmin, changeUserStatusService } from "./admin.service.js";
export const allUsersAdminController = async (c) => {
    try {
        const users = await allUsersAdmin();
        return c.json({ message: 'All users fetched successfully', users }, 200);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        return c.json({ message: error.message }, 500);
    }
};
export const changeUserStatusController = async (c) => {
    const { id } = c.req.param();
    const { status } = await c.req.json();
    if (!id || !status) {
        return c.json({ message: 'User ID and status are required' }, 400);
    }
    try {
        await changeUserStatusService(id, status);
        return c.json({ message: `User status changed to ${status} successfully` }, 200);
    }
    catch (error) {
        console.error('Error changing user status:', error);
        return c.json({ message: error.message }, 500);
    }
};
