import { Hono } from "hono";

export const adminApi = new Hono()

adminApi.get('/', (c) => {
  return c.text('Hello Admin API!')
})