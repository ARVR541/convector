import type { CurrencyCode } from "../../types/domain"
import { CURRENCIES } from "../../utils/constants"

interface CurrencySelectProps {
  id: string
  label: string
  value: CurrencyCode
  disabled: boolean
  onChange: (currency: CurrencyCode) => void
}

export const CurrencySelect = ({ id, label, value, disabled, onChange }: CurrencySelectProps) => (
  <div className="field-group">
    <label htmlFor={id} className="field-label">
      {label}
    </label>

    <select
      id={id}
      className="field-select"
      value={value}
      onChange={(event) => onChange(event.target.value as CurrencyCode)}
      aria-label={label}
      disabled={disabled}
    >
      {CURRENCIES.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {currency.code} · {currency.label}
        </option>
      ))}
    </select>
  </div>
)
