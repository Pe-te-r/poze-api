import { Hono } from "hono";
import { allUsersAdminController } from "./admin.controller.js";

export const adminApi = new Hono()

adminApi.get('/users',allUsersAdminController)