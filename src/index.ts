import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { authApi } from './auth/auth.route.js'
import { cors } from 'hono/cors'
import { dashboardApi } from './dashboard/dashboard.route.js'
import { adminApi } from './admin/admin.route.js'

const app = new Hono()
app.use('*', cors())


// root route
app.get('/', (c) => {
  return c.text('Hello Hono!')
})



// mount authApi router
app.route('/auth',authApi)
app.route('/dashboard',dashboardApi)
app.route('/admin',adminApi)


serve({
  fetch: app.fetch,
  port: 3001
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
