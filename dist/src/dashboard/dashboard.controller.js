import { getDashboardByIdService } from "./dashboard.service.js";
export const getDashboardByIdController = async (c) => {
    try {
        const userId = c.req.param('id'); // Get user ID from URL parameter
        if (!userId) {
            return c.json({ message: "User ID is required" }, 400);
        }
        const dashboard = await getDashboardByIdService(userId);
        if (!dashboard) {
            return c.json({ message: "Dashboard not found or user does not exist" }, 404);
        }
        return c.json({
            message: "Dashboard retrieved successfully",
            data: dashboard
        }, 200);
    }
    catch (error) {
        console.error('Dashboard controller error:', error);
        return c.json({ message: error.message }, 500);
    }
};
