import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Header.css'

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) {
      navigate(`/products?search=${encodeURIComponent(q)}`)
      setSearchQuery('')
    } else {
      navigate('/products')
    }
  }

  return (
    <header className="header" style={{ paddingTop: 'var(--safe-top)' }}>
      <div className="header-inner">
        <Link to="/" className="logo" aria-label="Jagdamba Jewellers Home">
          <span className="logo-text">Jagdamba</span>
          <span className="logo-sub">Jewellers</span>
        </Link>

        <div className="header-search-wrap">
          <form className="header-search" onSubmit={handleSearch} role="search">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jewellery..."
            className="header-search-input"
            aria-label="Search products"
          />
          <button type="submit" className="header-search-btn" aria-label="Search">
            <SearchIcon />
          </button>
          </form>
        </div>
      </div>
    </header>
  )
}
