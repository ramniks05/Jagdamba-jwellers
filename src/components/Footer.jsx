import { useState } from 'react'
import { Link } from 'react-router-dom'
import siteData from '../data/site.json'
import categoriesData from '../data/categories.json'
import './Footer.css'

const footer = siteData?.footer ?? {}
const contact = footer.contact ?? {}
const primaryMenu = Array.isArray(footer.primaryMenu) ? footer.primaryMenu : []
const categories = Array.isArray(categoriesData) ? categoriesData : []

const MailIcon = () => (
  <svg className="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
)
const PhoneIcon = () => (
  <svg className="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
)

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (email.trim()) setEmail('')
  }

  return (
    <footer className="footer">
      {/* Newsletter strip */}
      <div className="footer-newsletter">
        <div className="footer-newsletter-inner">
          <div className="footer-newsletter-text">
            <h3 className="footer-newsletter-title">Stay updated</h3>
            <p className="footer-newsletter-desc">Get new designs and offers in your inbox.</p>
          </div>
          <form className="footer-newsletter-form" onSubmit={handleNewsletter}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="footer-newsletter-input"
              aria-label="Email for newsletter"
            />
            <button type="submit" className="footer-newsletter-btn">Subscribe</button>
          </form>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="footer-main">
        <div className="footer-inner">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-text">Jagdamba</span>
              <span className="logo-sub">Jewellers</span>
            </Link>
            <p className="footer-tagline">{footer.tagline}</p>
            {contact.mapEmbedSrc ? (
              <div className="footer-map-wrap">
                <iframe
                  src={contact.mapEmbedSrc}
                  title="Jagdamba Jewellers on Google Maps"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            ) : null}
          </div>

          <div className="footer-col footer-col-shop">
            <h4 className="footer-heading">Shop</h4>
            <nav className="footer-nav">
              <Link to="/products">All jewellery</Link>
              {categories.map((cat) => (
                <Link key={cat.id} to={`/products?category=${cat.slug}`}>{cat.name}</Link>
              ))}
            </nav>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Quick links</h4>
            <nav className="footer-nav">
              {primaryMenu.map((item) => (
                <Link key={item.path} to={item.path}>{item.label}</Link>
              ))}
            </nav>
          </div>

          <div className="footer-col footer-contact">
            <h4 className="footer-heading">Contact us</h4>
            <address className="footer-address">
              <p className="footer-address-text">{contact.address}</p>
              <p>
                <a href={`mailto:${contact.email}`}><MailIcon /> {contact.email}</a>
              </p>
              <p>
                <a href={`tel:${(contact.mobile || '').replace(/\s/g, '')}`}><PhoneIcon /> {contact.mobile}</a>
              </p>
              <a
                href={`https://wa.me/${contact.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-whatsapp"
              >
                <WhatsAppIcon /> Enquire on WhatsApp
              </a>
            </address>
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="footer-trust">
        <div className="footer-trust-inner">
          <span className="footer-trust-item">Authentic jewellery</span>
          <span className="footer-trust-item">Secure enquiry</span>
          <span className="footer-trust-item">Visit our store</span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p className="footer-copy">© {new Date().getFullYear()} Jagdamba Jewellers. All rights reserved.</p>
          <nav className="footer-legal">
            <Link to="/">Privacy</Link>
            <Link to="/">Terms</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

function WhatsAppIcon() {
  return (
    <svg className="footer-contact-icon footer-whatsapp-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
