const TOKEN_KEY = 'jj_admin_token'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function getApiBase() {
  const v = import.meta.env.VITE_API_URL
  if (v !== undefined && v !== '') return String(v).replace(/\/$/, '')
  return ''
}

function url(path) {
  const base = getApiBase()
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

export function getAdminToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAdminToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

async function parseJson(res) {
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { error: text || res.statusText }
  }
  if (!res.ok) {
    const msg = data.error || data.message || res.statusText || 'Request failed'
    throw new ApiError(msg, res.status)
  }
  return data
}

export async function fetchProducts() {
  const res = await fetch(url('/api/products'))
  return parseJson(res)
}

export async function fetchProductBySlug(slug) {
  const res = await fetch(url(`/api/products/by-slug/${encodeURIComponent(slug)}`))
  return parseJson(res)
}

export async function fetchCategories() {
  const res = await fetch(url('/api/categories'))
  return parseJson(res)
}

export async function loginAdmin(password) {
  const res = await fetch(url('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  const data = await parseJson(res)
  if (data.token) setAdminToken(data.token)
  return data
}

export function logoutAdmin() {
  setAdminToken(null)
}

export async function createProduct(product) {
  const res = await fetch(url('/api/admin/products'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAdminToken()}`,
    },
    body: JSON.stringify(product),
  })
  return parseJson(res)
}

export async function updateProduct(id, product) {
  const res = await fetch(url(`/api/admin/products/${encodeURIComponent(id)}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAdminToken()}`,
    },
    body: JSON.stringify(product),
  })
  return parseJson(res)
}

export async function deleteProduct(id) {
  const res = await fetch(url(`/api/admin/products/${encodeURIComponent(id)}`), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getAdminToken()}`,
    },
  })
  return parseJson(res)
}
