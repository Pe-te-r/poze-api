import type { Context } from "hono";
import { loginService, registerService } from "./auth.service.js";

export const registerController = async(c:Context)=>{
    const registerData = await c.req.json();
    const data = await registerService(registerData);
    return c.json({ message: "User registered successfully", data }, 201);
}

export const loginController = async(c:Context)=>{
    const { phone, password } = await c.req.json();
    const data = await loginService(phone, password);
    return c.json({ message: "Login successful", data }, 200);
}