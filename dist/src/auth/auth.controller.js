import { loginService, registerService, setPinService, updatePinService } from "./auth.service.js";
export const registerController = async (c) => {
    try {
        const registerData = await c.req.json();
        await registerService(registerData);
        return c.json({ message: "User registered successfully. Try to login" }, 201);
    }
    catch (error) {
        return c.json({ message: error.message }, 400);
    }
};
export const loginController = async (c) => {
    try {
        const { phone, password } = await c.req.json();
        const data = await loginService(phone, password);
        return c.json({ status: 'success', message: "Login successful", data }, 200);
    }
    catch (error) {
        return c.json({ status: 'error', message: error.message }, 400);
    }
};
export const setPinController = async (c) => {
    const { userId, pin } = await c.req.json();
    // Assuming setPinService is defined in auth.service.ts
    const data = await setPinService(userId, pin);
    return c.json({ message: "PIN set successfully", 'data': {} }, 200);
};
export const changePinController = async (c) => {
    const { userId, newPin, reason } = await c.req.json();
    const data = await updatePinService(userId, newPin, reason);
    return c.json({ message: "PIN changed successfully", 'data': {} }, 200);
};
export const changePasswordController = async (c) => {
};
export const resetPasswordController = async (c) => {
};
