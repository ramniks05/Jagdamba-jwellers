import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  getAdminToken,
  loginAdmin,
  logoutAdmin,
  fetchProducts,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../lib/api'
import './Admin.css'

function emptyForm() {
  return {
    name: '',
    slug: '',
    category: '',
    categoryName: '',
    price: '',
    currency: '₹',
    image: '',
    imagesText: '',
    videoUrl: '',
    description: '',
    metal: '',
    weight: '',
    groupImage: '',
    featured: false,
  }
}

function productToForm(p) {
  const images = Array.isArray(p.images) ? p.images : []
  return {
    name: p.name || '',
    slug: p.slug || '',
    category: p.category || '',
    categoryName: p.categoryName || '',
    price: p.price != null ? String(p.price) : '',
    currency: p.currency || '₹',
    image: p.image || '',
    imagesText: images.join('\n'),
    videoUrl: p.videoUrl || '',
    description: p.description || '',
    metal: p.metal || '',
    weight: p.weight || '',
    featured: Boolean(p.featured),
  }
}

function formToPayload(form) {
  const images = form.imagesText
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
  const price = Number(form.price)
  return {
    name: form.name.trim(),
    slug: form.slug.trim(),
    category: form.category.trim(),
    categoryName: form.categoryName.trim(),
    currency: form.currency.trim() || '₹',
    price: Number.isFinite(price) ? price : 0,
    image: form.image.trim(),
    images,
    videoUrl: form.videoUrl.trim() || null,
    description: form.description.trim(),
    metal: form.metal.trim(),
    weight: form.weight.trim(),
    groupImage: form.groupImage.trim() || null,
    featured: form.featured,
  }
}

export default function Admin() {
  const [token, setTokenState] = useState(() => getAdminToken())
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loadError, setLoadError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [formMessage, setFormMessage] = useState(null)

  const loadData = useCallback(async () => {
    setLoadError(null)
    try {
      const [prods, cats] = await Promise.all([fetchProducts(), fetchCategories()])
      setProducts(Array.isArray(prods) ? prods : [])
      setCategories(Array.isArray(cats) ? cats : [])
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e))
    }
  }, [])

  useEffect(() => {
    if (token) loadData()
  }, [token, loadData])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError(null)
    try {
      await loginAdmin(loginPassword)
      setTokenState(getAdminToken())
      setLoginPassword('')
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleLogout = () => {
    logoutAdmin()
    setTokenState(null)
    setEditingId(null)
    setForm(emptyForm())
  }

  const onCategoryChange = (slug) => {
    const cat = categories.find((c) => c.slug === slug)
    setForm((f) => ({
      ...f,
      category: slug,
      categoryName: cat?.name || f.categoryName,
    }))
  }

  const startNew = () => {
    setEditingId(null)
    setForm(emptyForm())
    setFormMessage(null)
  }

  const startEdit = (p) => {
    setEditingId(p.id)
    setForm(productToForm(p))
    setFormMessage(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormMessage(null)
    const payload = formToPayload(form)
    setSaving(true)
    try {
      if (editingId) {
        await updateProduct(editingId, payload)
        setFormMessage('Product updated.')
      } else {
        await createProduct(payload)
        setFormMessage('Product created.')
        setForm(emptyForm())
        setEditingId(null)
      }
      await loadData()
    } catch (err) {
      setFormMessage(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    setFormMessage(null)
    try {
      await deleteProduct(id)
      if (editingId === id) startNew()
      await loadData()
      setFormMessage('Product deleted.')
    } catch (err) {
      setFormMessage(err instanceof Error ? err.message : String(err))
    }
  }

  if (!token) {
    return (
      <div className="admin">
        <div className="admin-login-card">
          <h1 className="admin-title">Admin</h1>
          <p className="admin-sub">Sign in to manage products</p>
          <form onSubmit={handleLogin} className="admin-login-form">
            <label className="admin-label">
              Password
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="admin-input"
                autoComplete="current-password"
                required
              />
            </label>
            {loginError && (
              <p className="admin-form-error" role="alert">
                {loginError}
              </p>
            )}
            <button type="submit" className="admin-btn primary">
              Sign in
            </button>
          </form>
          <Link to="/" className="admin-back">
            ← Back to site
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <h1 className="admin-title">Products</h1>
        <div className="admin-header-actions">
          <button type="button" className="admin-btn ghost" onClick={() => loadData()}>
            Refresh
          </button>
          <button type="button" className="admin-btn ghost" onClick={handleLogout}>
            Log out
          </button>
          <Link to="/" className="admin-link-site">
            View site
          </Link>
        </div>
      </header>

      {loadError && (
        <p className="admin-banner error" role="alert">
          {loadError} — is the API running? Use <code>npm run dev</code> or <code>npm run server</code>.
        </p>
      )}

      <div className="admin-layout">
        <section className="admin-list-section">
          <div className="admin-list-toolbar">
            <button type="button" className="admin-btn primary" onClick={startNew}>
              New product
            </button>
          </div>
          <ul className="admin-product-list">
            {products.map((p) => (
              <li key={p.id} className={editingId === p.id ? 'active' : ''}>
                <button type="button" className="admin-product-row" onClick={() => startEdit(p)}>
                  <span className="admin-product-name">{p.name}</span>
                  <span className="admin-product-meta">
                    {p.currency} {Number(p.price ?? 0).toLocaleString('en-IN')}
                  </span>
                </button>
                <button
                  type="button"
                  className="admin-btn danger small"
                  onClick={() => handleDelete(p.id)}
                  aria-label={`Delete ${p.name}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-form-section">
          <h2 className="admin-form-heading">{editingId ? 'Edit product' : 'New product'}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <label className="admin-label">
              Name
              <input
                className="admin-input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </label>
            <label className="admin-label">
              Slug (URL)
              <input
                className="admin-input"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="auto from name if left empty on server"
              />
            </label>
            <label className="admin-label">
              Category
              <select
                className="admin-input admin-select"
                value={form.category}
                onChange={(e) => onCategoryChange(e.target.value)}
                required
              >
                <option value="">Select…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-label">
              Category display name
              <input
                className="admin-input"
                value={form.categoryName}
                onChange={(e) => setForm((f) => ({ ...f, categoryName: e.target.value }))}
                required
              />
            </label>
            <div className="admin-row">
              <label className="admin-label">
                Price
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  step="any"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  required
                />
              </label>
              <label className="admin-label">
                Currency
                <input
                  className="admin-input"
                  value={form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                />
              </label>
            </div>
            <label className="admin-label">
              Main image URL
              <input
                className="admin-input"
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                required
              />
            </label>
            <label className="admin-label">
              Group / set image (optional)
              <input
                className="admin-input"
                value={form.groupImage}
                onChange={(e) => setForm((f) => ({ ...f, groupImage: e.target.value }))}
                placeholder="Full set or group photo URL"
              />
              <span className="admin-field-hint">
                Shown in the gallery and on hover in listings when set (e.g. necklace + earrings together).
              </span>
            </label>
            <label className="admin-label">
              Extra image URLs (one per line)
              <textarea
                className="admin-textarea"
                value={form.imagesText}
                onChange={(e) => setForm((f) => ({ ...f, imagesText: e.target.value }))}
                rows={4}
              />
            </label>
            <label className="admin-label">
              Video URL (optional)
              <input
                className="admin-input"
                value={form.videoUrl}
                onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
              />
            </label>
            <label className="admin-label">
              Description
              <textarea
                className="admin-textarea"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                required
              />
            </label>
            <div className="admin-row">
              <label className="admin-label">
                Metal
                <input
                  className="admin-input"
                  value={form.metal}
                  onChange={(e) => setForm((f) => ({ ...f, metal: e.target.value }))}
                />
              </label>
              <label className="admin-label">
                Weight
                <input
                  className="admin-input"
                  value={form.weight}
                  onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                />
              </label>
            </div>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
              />
              Featured on home
            </label>
            {formMessage && (
              <p className={formMessage.includes('created') || formMessage.includes('updated') || formMessage.includes('deleted') ? 'admin-form-success' : 'admin-form-error'}>
                {formMessage}
              </p>
            )}
            <div className="admin-form-actions">
              <button type="submit" className="admin-btn primary" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create product'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
