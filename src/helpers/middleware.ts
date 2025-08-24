import type{ Context, Next } from "hono";
import { verify } from "hono/jwt";
import "dotenv/config"
import { authTokenService } from "./tokenService.js";

// export const verifyToken = async (token: string, secret: string) => {
//     try {
//         const decoded = await verify(token as string, secret)
//         return decoded;
//     } catch (error: any) {
//         return null
//     }
// }

export const authMiddleware=async(c: Context,next: Next,role:string)=>{
    const token= c.req.header("Authorization");
    if(!token) return c.json({"error":"unauthorized no token provided"},401)
    const decoded=  authTokenService.verifyAccessToken(token)
    if(!decoded) return c.json({"error":"token not valid"})
    console.log(decoded)
    if(decoded.role!==role) return c.json({msg:"you are unauthorized"},401)    
    return next()
}

export const allMiddleware=async(c: Context,next: Next)=>{
    const token= c.req.header("Authorization");
    if(!token) return c.json({"error":"unauthorized no token provided"},401)
    const decoded=  authTokenService.verifyAccessToken(token)
    if(!decoded) return c.json({"error":"token not valid"})
    console.log('decoded',decoded)
    c.set("user",decoded)
    return next()
}


export function generateRandomCode(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789"; // No 0, only 1-9
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }

  return result;
}


export const customerRoleAuth = async (c: Context, next: Next) => await authMiddleware(c, next,"customer")
export const adminRoleAuth = async (c: Context, next: Next) => await authMiddleware(c, next,"admin")
export const allRoleAuth = async (c: Context, next: Next) => await allMiddleware(c, next)