interface ErrorStateProps {
  title: string
  message: string
  onRetry: () => void
  isRetrying?: boolean
}

export const ErrorState = ({ title, message, onRetry, isRetrying = false }: ErrorStateProps) => (
  <section className="glass-panel error-state" role="alert" aria-live="assertive">
    <h2>{title}</h2>
    <p>{message}</p>

    <button type="button" className="primary-button" onClick={onRetry} disabled={isRetrying}>
      {isRetrying ? "Повтор..." : "Повторить"}
    </button>
  </section>
)
