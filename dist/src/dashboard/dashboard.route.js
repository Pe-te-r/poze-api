import { Hono } from "hono/quick";
import { getDashboardByIdController } from "./dashboard.controller.js";
export const dashboardApi = new Hono();
dashboardApi.get('/:id', getDashboardByIdController);
