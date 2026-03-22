import { useState } from 'react'
import { Link } from 'react-router-dom'
import mainBannerData from '../data/banners.json'
import categoriesDataImport from '../data/categories.json'
import { useProducts } from '../hooks/useProducts'
import './Home.css'

const HERO_FALLBACK_IMAGE = 'https://placehold.co/1200x700/1a1510/c9a227?text=Jagdamba+Jewellers&font=serif'

const defaultBanner = {
  title: 'Elegance Redefined',
  subtitle: 'Handcrafted Jewelry for Every Occasion',
  image: HERO_FALLBACK_IMAGE,
  ctaText: 'Explore Collection',
  ctaLink: '/products'
}

const mainBanner = mainBannerData?.mainBanner ?? defaultBanner
const collectionBanners = mainBannerData?.collectionBanners ?? []
const categoriesData = Array.isArray(categoriesDataImport) ? categoriesDataImport : []

export default function Home() {
  const { products: productsData, loading, error } = useProducts()
  const featuredProducts = (Array.isArray(productsData) ? productsData : [])
    .filter((p) => p?.featured)
    .slice(0, 6)
  const [heroImage, setHeroImage] = useState(mainBanner?.image ?? HERO_FALLBACK_IMAGE)

  const onHeroImageError = () => {
    setHeroImage(HERO_FALLBACK_IMAGE)
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-bg">
          <img
            src={heroImage}
            alt=""
            referrerPolicy="no-referrer"
            onError={onHeroImageError}
          />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <p className="hero-subtitle">{mainBanner.subtitle}</p>
          <h1 className="hero-title">{mainBanner.title}</h1>
          <Link to={mainBanner.ctaLink} className="hero-cta">
            {mainBanner.ctaText}
          </Link>
        </div>
      </section>

      <section className="section categories-section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid">
          {categoriesData.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="category-card"
            >
              <div className="category-card-img">
                <img src={cat.image} alt={cat.name} />
              </div>
              <span className="category-card-name">{cat.name}</span>
              <span className="category-card-count">{cat.productCount} pieces</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section collection-banners">
        <h2 className="section-title">Collections</h2>
        <div className="collection-grid">
          {collectionBanners.map((col) => (
            <Link
              key={col.id}
              to={col.link}
              className="collection-card"
            >
              <div className="collection-card-img">
                <img src={col.image} alt={col.title} />
                <div className="collection-card-overlay" />
              </div>
              <div className="collection-card-content">
                <h3>{col.title}</h3>
                <p>{col.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section featured-section">
        <h2 className="section-title">Featured Pieces</h2>
        {loading && <p className="home-data-hint">Loading featured products…</p>}
        {error && (
          <p className="home-data-error" role="alert">
            Could not load products ({error}). Start the API with <code>npm run dev</code> or{' '}
            <code>npm run server</code>.
          </p>
        )}
        {!loading && !error && (
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.slug}`}
                className="product-card"
              >
                <div className="product-card-media">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-card-info">
                  <span className="product-card-category">{product.categoryName}</span>
                  <h3 className="product-card-name">{product.name}</h3>
                  <p className="product-card-price">
                    {product.currency} {Number(product?.price ?? 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
        <Link to="/products" className="section-cta">
          View All Collections
        </Link>
      </section>
    </div>
  )
}
