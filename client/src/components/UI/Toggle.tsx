interface ToggleProps {
  checked: boolean
  onToggle: () => void
  label: string
}

export const Toggle = ({ checked, onToggle, label }: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    className={`toggle ${checked ? "is-checked" : ""}`}
    onClick={onToggle}
  >
    <span className="toggle-track" aria-hidden="true">
      <span className="toggle-thumb" />
    </span>
    <span className="toggle-label">{checked ? "Тёмная" : "Светлая"}</span>
  </button>
)
