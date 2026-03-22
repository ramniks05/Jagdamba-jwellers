import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const PRODUCTS_PATH = path.join(ROOT, 'src', 'data', 'products.json')

if (!process.env.JWT_SECRET) {
  console.warn('[server] JWT_SECRET not set — using insecure dev default. Set JWT_SECRET in .env for production.')
  process.env.JWT_SECRET = 'dev-jwt-secret-change-me'
}
if (!process.env.ADMIN_PASSWORD) {
  console.warn('[server] ADMIN_PASSWORD not set — using default "admin123". Set ADMIN_PASSWORD in .env.')
  process.env.ADMIN_PASSWORD = 'admin123'
}

const PORT = Number(process.env.PORT) || 3001
const JWT_SECRET = process.env.JWT_SECRET
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '2mb' }))

async function readProducts() {
  const raw = await fs.readFile(PRODUCTS_PATH, 'utf8')
  return JSON.parse(raw)
}

async function writeProducts(data) {
  const tmp = `${PRODUCTS_PATH}.${Date.now()}.tmp`
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8')
  await fs.rename(tmp, PRODUCTS_PATH)
}

function slugify(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeProduct(body, existingId) {
  const name = String(body.name || '').trim()
  let slug = String(body.slug || '').trim()
  if (!slug && name) slug = slugify(name)
  slug = slugify(slug)
  const price = Number(body.price)
  const imagesRaw = body.images
  let images = []
  if (Array.isArray(imagesRaw)) {
    images = imagesRaw.map((u) => String(u || '').trim()).filter(Boolean)
  } else if (typeof imagesRaw === 'string') {
    images = imagesRaw
      .split(/[\n,]/)
      .map((u) => u.trim())
      .filter(Boolean)
  }
  const image = String(body.image || images[0] || '').trim()
  return {
    id: existingId || body.id || `p${Date.now()}`,
    name,
    slug,
    category: String(body.category || '').trim(),
    categoryName: String(body.categoryName || '').trim(),
    currency: String(body.currency || '₹').trim() || '₹',
    price: Number.isFinite(price) ? price : 0,
    image,
    images: images.length ? images : image ? [image] : [],
    videoUrl: body.videoUrl == null || body.videoUrl === '' ? null : String(body.videoUrl).trim(),
    groupImage:
      body.groupImage == null || body.groupImage === ''
        ? null
        : String(body.groupImage).trim(),
    description: String(body.description || '').trim(),
    metal: String(body.metal || '').trim(),
    weight: String(body.weight || '').trim(),
    featured: Boolean(body.featured),
  }
}

function requireAuth(req, res, next) {
  const h = req.headers.authorization
  if (!h?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    jwt.verify(h.slice(7), JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/products', async (_req, res) => {
  try {
    const products = await readProducts()
    res.json(products)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to read products' })
  }
})

app.get('/api/products/by-slug/:slug', async (req, res) => {
  try {
    const slug = String(req.params.slug || '').trim()
    const products = await readProducts()
    const product = products.find((p) => p.slug === slug)
    if (!product) return res.status(404).json({ error: 'Not found' })
    res.json(product)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to read product' })
  }
})

app.get('/api/categories', async (_req, res) => {
  try {
    const p = path.join(ROOT, 'src', 'data', 'categories.json')
    const raw = await fs.readFile(p, 'utf8')
    res.json(JSON.parse(raw))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to read categories' })
  }
})

app.post('/api/auth/login', (req, res) => {
  const password = req.body?.password
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' })
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})

app.post('/api/admin/products', requireAuth, async (req, res) => {
  try {
    const products = await readProducts()
    const normalized = normalizeProduct(req.body)
    if (!normalized.name) return res.status(400).json({ error: 'Name is required' })
    if (!normalized.slug) return res.status(400).json({ error: 'Slug is required (or provide a name)' })
    if (!normalized.category) return res.status(400).json({ error: 'Category is required' })
    if (products.some((p) => p.slug === normalized.slug)) {
      return res.status(409).json({ error: 'Another product already uses this slug' })
    }
    products.push(normalized)
    await writeProducts(products)
    res.status(201).json(normalized)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to create product' })
  }
})

app.put('/api/admin/products/:id', requireAuth, async (req, res) => {
  try {
    const id = String(req.params.id || '')
    const products = await readProducts()
    const idx = products.findIndex((p) => p.id === id)
    if (idx === -1) return res.status(404).json({ error: 'Product not found' })
    const normalized = normalizeProduct(req.body, id)
    if (!normalized.name) return res.status(400).json({ error: 'Name is required' })
    if (!normalized.slug) return res.status(400).json({ error: 'Slug is required' })
    if (!normalized.category) return res.status(400).json({ error: 'Category is required' })
    const slugTaken = products.some((p, i) => i !== idx && p.slug === normalized.slug)
    if (slugTaken) return res.status(409).json({ error: 'Another product already uses this slug' })
    products[idx] = normalized
    await writeProducts(products)
    res.json(normalized)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to update product' })
  }
})

app.delete('/api/admin/products/:id', requireAuth, async (req, res) => {
  try {
    const id = String(req.params.id || '')
    const products = await readProducts()
    const next = products.filter((p) => p.id !== id)
    if (next.length === products.length) return res.status(404).json({ error: 'Product not found' })
    await writeProducts(next)
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

app.listen(PORT, () => {
  console.log(`[server] API listening on http://localhost:${PORT}`)
})
