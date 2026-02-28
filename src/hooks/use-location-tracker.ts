import { useState, useEffect, useCallback, useRef } from "react"

export function useLocationTracker() {
  const [distance, setDistance] = useState(0) // in meters
  const [duration, setDuration] = useState(0) // in seconds
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastPosition = useRef<GeolocationPosition | null>(null)
  const watchId = useRef<number | null>(null)
  const startTime = useRef<number | null>(null)
  const timerId = useRef<number | null>(null)

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3 // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocalização não suportada pelo navegador.")
      return
    }

    setDistance(0)
    setDuration(0)
    setIsTracking(true)
    setError(null)
    lastPosition.current = null
    startTime.current = Date.now()

    // Start duration timer
    timerId.current = window.setInterval(() => {
      if (startTime.current) {
        setDuration(Math.floor((Date.now() - startTime.current) / 1000))
      }
    }, 1000)

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        if (lastPosition.current) {
          const d = calculateDistance(
            lastPosition.current.coords.latitude,
            lastPosition.current.coords.longitude,
            position.coords.latitude,
            position.coords.longitude
          )
          // Filter out small movements (noise)
          if (d > 2) {
            setDistance((prev) => prev + d)
          }
        }
        lastPosition.current = position
      },
      (err) => {
        setError(`Erro ao rastrear localização: ${err.message}`)
        setIsTracking(false)
        if (timerId.current) clearInterval(timerId.current)
      },
      { enableHighAccuracy: true }
    )
  }, [])

  const stopTracking = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
    if (timerId.current) {
      clearInterval(timerId.current)
      timerId.current = null
    }
    setIsTracking(false)
  }, [])

  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current)
      }
      if (timerId.current) {
        clearInterval(timerId.current)
      }
    }
  }, [])

  return { distance, duration, isTracking, startTracking, stopTracking, error }
}
