import { useCallback, useEffect, useRef, useState } from "react"
import type { ToastInput, ToastMessage } from "../types/domain"

const DEFAULT_TOAST_DURATION_MS = 3600

const createToastId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const timeoutMapRef = useRef<Map<string, number>>(new Map())

  const removeToast = useCallback((id: string) => {
    setToasts((previousToasts) => previousToasts.filter((toast) => toast.id !== id))

    const timeoutId = timeoutMapRef.current.get(id)

    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId)
      timeoutMapRef.current.delete(id)
    }
  }, [])

  const pushToast = useCallback(
    (input: ToastInput): string => {
      const id = createToastId()
      const toast: ToastMessage = {
        id,
        durationMs: DEFAULT_TOAST_DURATION_MS,
        ...input
      }

      setToasts((previousToasts) => [...previousToasts, toast])

      const timeoutId = window.setTimeout(() => {
        removeToast(id)
      }, toast.durationMs ?? DEFAULT_TOAST_DURATION_MS)

      timeoutMapRef.current.set(id, timeoutId)
      return id
    },
    [removeToast]
  )

  useEffect(
    () => () => {
      timeoutMapRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId)
      })
      timeoutMapRef.current.clear()
    },
    []
  )

  return {
    toasts,
    pushToast,
    removeToast
  }
}
