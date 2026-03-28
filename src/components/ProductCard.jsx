import { useState } from 'react'
import { Link } from 'react-router-dom'
import './ProductCard.css'

export default function ProductCard({ product }) {
  const [showVideo, setShowVideo] = useState(false)
  const [showGroup, setShowGroup] = useState(false)
  const hasVideo = !!product.videoUrl
  const groupImage = product.groupImage?.trim() || ''
  const hasGroup = !hasVideo && !!groupImage

  const toggleVideo = (e) => {
    if (!hasVideo) return
    e.preventDefault()
    e.stopPropagation()
    setShowVideo((v) => !v)
  }

  return (
    <Link to={`/product/${product.slug}`} className="product-card">
      <div
        className="product-card-media"
        onMouseEnter={() => {
          if (hasVideo) setShowVideo(true)
          else if (hasGroup) setShowGroup(true)
        }}
        onMouseLeave={() => {
          setShowVideo(false)
          setShowGroup(false)
        }}
        onClick={hasVideo ? toggleVideo : undefined}
      >
        {hasVideo && showVideo ? (
          <video
            src={product.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="product-card-video"
          />
        ) : hasGroup && showGroup ? (
          <img src={groupImage} alt="" className="product-card-group-img" />
        ) : (
          <img src={product.image} alt={product.name} />
        )}
        {hasVideo && (
          <span className="product-card-video-badge" aria-hidden>
            Video
          </span>
        )}
        {hasGroup && (
          <span className="product-card-group-badge" aria-hidden>
            Set
          </span>
        )}
      </div>
      <div className="product-card-info">
        <span className="product-card-category">{product.categoryName}</span>
        <h3 className="product-card-name">{product.name}</h3>
      </div>
    </Link>
  )
}
