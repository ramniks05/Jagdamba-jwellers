/**
 * Vercel serverless: handles all /api/* routes (Express app).
 * Local dev still uses `node server/index.js` + Vite proxy.
 */
import { createApp } from '../server/app.js'

const app = createApp()
export default app
