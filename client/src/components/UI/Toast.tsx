import type { ToastMessage } from "../../types/domain"

interface ToastProps {
  toast: ToastMessage
  onClose: (id: string) => void
}

export const Toast = ({ toast, onClose }: ToastProps) => (
  <article className={`toast toast-${toast.kind}`} role={toast.kind === "error" ? "alert" : "status"}>
    <div className="toast-content">
      <strong>{toast.title}</strong>
      <p>{toast.message}</p>
    </div>

    <button
      type="button"
      className="toast-close"
      aria-label="Закрыть уведомление"
      onClick={() => onClose(toast.id)}
    >
      ×
    </button>
  </article>
)
