import { Hono } from "hono";
import { changePinController, loginController, registerController, setPinController } from "./auth.controller.js";
import { allMiddleware } from "../helpers/middleware.js";
import { auth } from "hono/utils/basic-auth";
// create sub-app with basePath
export const authApi = new Hono();
authApi.post('/register', registerController);
authApi.post('/login', loginController);
authApi.patch('/pin/set', allMiddleware, setPinController);
authApi.patch('/pin/change', allMiddleware, changePinController);
authApi.patch('/password/change', allMiddleware, changePinController);
authApi.patch('/password/reset', allMiddleware, changePinController);
