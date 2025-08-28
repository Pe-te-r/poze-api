import { Hono } from "hono";
import { allUsersAdminController, changeUserStatusController } from "./admin.controller.js";

export const adminApi = new Hono()

adminApi.get('/users',allUsersAdminController)
adminApi.patch('/users/:id/status', changeUserStatusController)