import type { Context } from "hono";

export const registerController = async(c:Context)=>{
    const registerData = await c.req.json();
    
}

export const loginController = async(c:Context)=>{

}