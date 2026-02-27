import { useState, useEffect, useCallback } from "react"

export function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [error, setError] = useState<string | null>(null)

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const subscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const response = await fetch("/api/vapid-public-key")
      const { publicKey } = await response.json()

      if (!publicKey) {
        throw new Error("VAPID public key not found")
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      await fetch("/api/subscribe", {
        method: "POST",
        body: JSON.stringify(sub),
        headers: {
          "Content-Type": "application/json",
        },
      })

      setSubscription(sub)
      setIsSubscribed(true)
    } catch (err: any) {
      setError(`Erro ao se inscrever para notificações: ${err.message}`)
      console.error(err)
    }
  }, [])

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) {
            setSubscription(sub)
            setIsSubscribed(true)
          }
        })
      })
    }
  }, [])

  const sendNotification = async (title: string, body: string, url = "/") => {
    try {
      await fetch("/api/send-notification", {
        method: "POST",
        body: JSON.stringify({ title, body, data: { url } }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    } catch (err) {
      console.error("Erro ao enviar notificação:", err)
    }
  }

  return { isSubscribed, subscribe, sendNotification, error }
}
