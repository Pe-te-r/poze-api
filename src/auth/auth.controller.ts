import type { Context } from "hono";
import { loginService, registerService, setPinService, updatePinService } from "./auth.service.js";

export const registerController = async(c:Context)=>{
    try {
        const registerData = await c.req.json();
        const data = await registerService(registerData);
        return c.json({ message: "User registered successfully", data }, 201);
    } catch (error) {
        return c.json({ message: (error as Error).message }, 400);
    }
}

export const loginController = async(c:Context)=>{
    try {
        const { phone, password } = await c.req.json();
        const data = await loginService(phone, password);
        return c.json({ message: "Login successful", data }, 200);
    } catch (error) {
        console.error(error);
        return c.json({ message: (error as Error).message }, 400);
    }
}

export const setPinController = async(c:Context)=>{
    const { userId, pin } = await c.req.json();
    // Assuming setPinService is defined in auth.service.ts
    const data = await setPinService(userId, pin);
    return c.json({ message: "PIN set successfully", 'data' :{}}, 200);
}

export const changePinController = async(c:Context)=>{
    const { userId, newPin, reason } = await c.req.json();
    const data = await updatePinService(userId, newPin, reason);
    return c.json({ message: "PIN changed successfully", 'data' :{}}, 200);
}

export const changePasswordController = async(c:Context)=>{
    
}

export const resetPasswordController = async(c:Context)=>{

}