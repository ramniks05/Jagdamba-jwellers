import { useState, useEffect, useCallback } from 'react'
import { fetchProductBySlug, ApiError } from '../lib/api'

export function useProduct(slug) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(Boolean(slug))
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!slug) {
      setProduct(null)
      setLoading(false)
      setError(null)
      setNotFound(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    setNotFound(false)
    fetchProductBySlug(slug)
      .then((data) => {
        if (!cancelled) setProduct(data)
      })
      .catch((e) => {
        if (!cancelled) {
          setProduct(null)
          if (e instanceof ApiError && e.status === 404) {
            setNotFound(true)
            setError(null)
          } else {
            setError(e instanceof Error ? e.message : String(e))
            setNotFound(false)
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug, tick])

  return { product, loading, error, notFound, refetch }
}
