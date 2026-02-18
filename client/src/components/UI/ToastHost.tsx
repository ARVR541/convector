import type { ToastMessage } from "../../types/domain"
import { Toast } from "./Toast"

interface ToastHostProps {
  toasts: ToastMessage[]
  onClose: (id: string) => void
}

export const ToastHost = ({ toasts, onClose }: ToastHostProps) => (
  <div className="toast-host" aria-live="polite" aria-atomic="false">
    {toasts.map((toast) => (
      <Toast key={toast.id} toast={toast} onClose={onClose} />
    ))}
  </div>
)
