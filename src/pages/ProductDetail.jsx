import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import NotFound from './NotFound'
import { useProduct } from '../hooks/useProduct'
import './ProductDetail.css'

const WHATSAPP_NUMBER = '919876543210'

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function ProductImageZoom({ src, alt }) {
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const [hovered, setHovered] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const viewportRef = useRef(null)

  const onMove = useCallback((e) => {
    const el = viewportRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin({ x: clamp(x, 0, 100), y: clamp(y, 0, 100) })
  }, [])

  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setModalOpen(false)
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [modalOpen])

  return (
    <>
      <div
        ref={viewportRef}
        className="product-zoom-viewport"
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img
          src={src}
          alt={alt}
          className={`product-zoom-img ${hovered ? 'is-zoomed' : ''}`}
          style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
          draggable={false}
        />
        <button
          type="button"
          className="product-zoom-expand"
          onClick={() => setModalOpen(true)}
          aria-label="View image larger"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
          <span>Zoom</span>
        </button>
      </div>

      {modalOpen && (
        <div
          className="product-zoom-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Product image"
          onClick={() => setModalOpen(false)}
        >
          <button type="button" className="product-zoom-modal-close" onClick={() => setModalOpen(false)} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <img
            src={src}
            alt=""
            className="product-zoom-modal-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}

export default function ProductDetail() {
  const { slug } = useParams()
  const { product, loading, error, notFound, refetch } = useProduct(slug)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    setActiveImageIndex(0)
  }, [product?.id])

  if (notFound) return <NotFound />

  if (loading) {
    return (
      <div className="product-detail">
        <p className="product-detail-status">Loading product…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="product-detail">
        <div className="product-detail-error" role="alert">
          <p>{error}</p>
          <button type="button" className="product-detail-retry" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!product) return <NotFound />

  const productUrl = typeof window !== 'undefined' ? window.location.href : ''
  const enquiryText = `Hi! I am interested in this product:\n\n*${product.name}*\n${product.currency} ${product.price.toLocaleString('en-IN')}\n\nProduct link: ${productUrl}`
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(enquiryText)}`

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `${product.name} - ${product.currency} ${product.price.toLocaleString('en-IN')}`,
        url: productUrl,
      }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(productUrl)
    }
  }

  const groupImage = product.groupImage?.trim() || null
  const baseImages = product.images && product.images.length ? [...product.images] : [product.image]
  const images =
    groupImage && !baseImages.includes(groupImage) ? [groupImage, ...baseImages] : baseImages

  return (
    <div className="product-detail">
      <div className="product-detail-grid">
        <div className="product-detail-media">
          <div className="product-detail-main-media">
            {product.videoUrl ? (
              <video
                src={product.videoUrl}
                controls
                loop
                playsInline
                poster={product.image}
                className="product-detail-video"
              />
            ) : (
              <ProductImageZoom
                key={images[activeImageIndex]}
                src={images[activeImageIndex]}
                alt={product.name}
              />
            )}
          </div>
          {!product.videoUrl && images.length > 1 && (
            <div className="product-detail-thumbs">
              {images.map((img, i) => {
                const isGroupThumb = groupImage && img === groupImage
                return (
                  <button
                    key={`${img}-${i}`}
                    type="button"
                    className={`thumb ${activeImageIndex === i ? 'active' : ''} ${isGroupThumb ? 'thumb--group' : ''}`}
                    onClick={() => setActiveImageIndex(i)}
                    title={isGroupThumb ? 'Set / group view' : undefined}
                    aria-label={isGroupThumb ? `Set view ${i + 1}` : `Image ${i + 1}`}
                  >
                    <img src={img} alt="" />
                    {isGroupThumb && <span className="thumb-group-badge">Set</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <Link to="/products" className="product-detail-back">
            Back to Collections
          </Link>
          <span className="product-detail-category">{product.categoryName}</span>
          <h1 className="product-detail-name">{product.name}</h1>
          <p className="product-detail-price">
            {product.currency} {product.price.toLocaleString('en-IN')}
          </p>
          <p className="product-detail-desc">{product.description}</p>
          {product.metal && (
            <p className="product-detail-meta">
              <span>Metal:</span> {product.metal}
            </p>
          )}
          {product.weight && (
            <p className="product-detail-meta">
              <span>Weight:</span> {product.weight}
            </p>
          )}

          <div className="product-detail-actions">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              Enquire on WhatsApp
            </a>
            <button type="button" className="btn-share" onClick={shareLink}>
              Share product link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
