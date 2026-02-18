interface LoaderProps {
  label?: string
}

export const Loader = ({ label = "Загрузка..." }: LoaderProps) => (
  <div className="loader" role="status" aria-live="polite">
    <span className="loader-spinner" aria-hidden="true" />
    <span>{label}</span>
  </div>
)
