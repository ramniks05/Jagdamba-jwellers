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
  ctaLink: '/products',
}

/** Accepts raw 11-char id or youtu.be / youtube.com URLs */
function getYoutubeVideoId(urlOrId) {
  if (urlOrId == null || urlOrId === '') return null
  const s = String(urlOrId).trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s
  const m = s.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

const mainBanner = mainBannerData?.mainBanner ?? defaultBanner
const heroYoutubeId =
  getYoutubeVideoId(mainBanner?.youtubeVideoId) ||
  getYoutubeVideoId(mainBanner?.youtubeUrl)
const collectionBanners = mainBannerData?.collectionBanners ?? []
const categoriesData = Array.isArray(categoriesDataImport) ? categoriesDataImport : []

export default function Home() {
  const { products: productsData, loading, error } = useProducts()
  const featuredProducts = (Array.isArray(productsData) ? productsData : [])
    .filter((p) => p?.featured)
    .slice(0, 6)
  const [heroImage, setHeroImage] = useState(mainBanner?.image ?? HERO_FALLBACK_IMAGE)
  /** Browsers block unmuted autoplay; after user taps "Sound on", reload embed with mute=0 */
  const [heroSoundOn, setHeroSoundOn] = useState(false)

  const onHeroImageError = () => {
    setHeroImage(HERO_FALLBACK_IMAGE)
  }

  const youtubeEmbedSrc = heroYoutubeId
    ? `https://www.youtube.com/embed/${heroYoutubeId}?autoplay=1&mute=${heroSoundOn ? 0 : 1}&loop=1&playlist=${heroYoutubeId}&controls=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`
    : null

  return (
    <>
      {/* Hero outside .home so full-width video is never clipped by a parent */}
      <section className={`hero ${heroYoutubeId ? 'hero--youtube' : ''}`}>
        <div className={`hero-bg ${heroYoutubeId ? 'hero-bg--video' : ''}`}>
          {heroYoutubeId && youtubeEmbedSrc ? (
            <div className="hero-video-wrap">
              <iframe
                key={`${heroYoutubeId}-${heroSoundOn ? 'sound' : 'muted'}`}
                src={youtubeEmbedSrc}
                title="Featured video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="eager"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : (
            <img
              src={heroImage}
              alt=""
              referrerPolicy="no-referrer"
              onError={onHeroImageError}
            />
          )}
          <div className="hero-overlay" />
          {heroYoutubeId && !heroSoundOn && (
            <button
              type="button"
              className="hero-sound-btn"
              onClick={() => setHeroSoundOn(true)}
              aria-label="Enable video sound"
            >
              <span className="hero-sound-btn-icon" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M15.54 8.46a5 5 0 010 7.07" />
                  <path d="M19.07 4.93a10 10 0 010 14.14" />
                </svg>
              </span>
              Sound on
            </button>
          )}
        </div>
        <div className="hero-content">
          <p className="hero-subtitle">{mainBanner.subtitle}</p>
          <h1 className="hero-title">{mainBanner.title}</h1>
          <Link to={mainBanner.ctaLink} className="hero-cta">
            {mainBanner.ctaText}
          </Link>
        </div>
      </section>

      <div className="home">
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
    </>
  )
}
