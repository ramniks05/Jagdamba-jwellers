import { Link } from 'react-router-dom'
import categoriesData from '../data/categories.json'
import './CategoriesBar.css'

const categories = Array.isArray(categoriesData) ? categoriesData : []

export default function CategoriesBar() {
  return (
    <div className="categories-bar">
      <div className="categories-bar-inner">
        <span className="categories-bar-label">Categories</span>
        <nav className="categories-bar-links" aria-label="Product categories">
          <Link to="/products" className="categories-bar-link">All</Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="categories-bar-link"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
