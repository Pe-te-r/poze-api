import { Hono } from "hono";
import { loginController, registerController, setPinController } from "./auth.controller.js";

// create sub-app with basePath
export const authApi = new Hono();

authApi.post('/register', registerController);
authApi.post('/login', loginController);
authApi.patch('/set/pin',    setPinController);
