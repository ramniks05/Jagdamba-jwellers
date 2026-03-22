import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{
          padding: '2rem',
          margin: '1rem',
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-gold)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)'
        }}>
          <h2 style={{ color: 'var(--color-gold)', marginBottom: '0.5rem' }}>Something went wrong</h2>
          <pre style={{ fontSize: '0.85rem', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.message ?? String(this.state.error)}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
