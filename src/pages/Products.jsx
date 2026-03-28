import { useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import categoriesData from '../data/categories.json'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../hooks/useProducts'
import './Products.css'

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'name', label: 'Name A–Z' },
]

export default function Products() {
  const [searchParams] = useSearchParams()
  const categorySlug = searchParams.get('category') || ''
  const searchQ = (searchParams.get('search') || '').trim().toLowerCase()
  const [sort, setSort] = useState('featured')
  const { products: productsData, loading, error, refetch } = useProducts()

  const filteredAndSorted = useMemo(() => {
    let list = [...(productsData || [])]
    if (categorySlug) {
      list = list.filter((p) => p.category === categorySlug)
    }
    if (searchQ) {
      list = list.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(searchQ) ||
          (p.description || '').toLowerCase().includes(searchQ)
      )
    }
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    else list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    return list
  }, [categorySlug, searchQ, sort, productsData])

  if (loading && (!productsData || productsData.length === 0)) {
    return (
      <div className="products-page">
        <p className="products-page-status">Loading products…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="products-page-error" role="alert">
          <p>Could not load products: {error}</p>
          <button type="button" className="products-retry" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h1 className="products-title">
          {searchQ
            ? `Search: "${searchParams.get('search')}"`
            : categorySlug
              ? categoriesData.find((c) => c.slug === categorySlug)?.name || 'Collections'
              : 'All Collections'}
        </h1>
        <p className="products-count">{filteredAndSorted.length} pieces</p>
      </div>

      <div className="products-layout">
        <aside className="products-sidebar">
          <div className="sidebar-block">
            <h3>Category</h3>
            <div className="sidebar-scroll">
              <Link
                to="/products"
                className={`sidebar-link ${!categorySlug ? 'active' : ''}`}
              >
                All
              </Link>
              {categoriesData.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className={`sidebar-link ${categorySlug === cat.slug ? 'active' : ''}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <div className="products-main">
          <div className="products-toolbar">
            <label className="sort-label">
              Sort by
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="sort-select"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="products-grid">
            {filteredAndSorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredAndSorted.length === 0 && (
            <p className="products-empty">
              {searchQ ? 'No products match your search.' : 'No products in this category.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
