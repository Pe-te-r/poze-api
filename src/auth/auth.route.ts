import { Hono } from "hono";
import { loginController, registerController } from "./auth.controller.js";

// create sub-app with basePath
export const authApi = new Hono();

authApi.post('/register', registerController);
authApi.post('/login', loginController);
