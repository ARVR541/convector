import { CURRENCIES } from "../../utils/constants";
export const CurrencySelect = ({ id, label, value, disabled, onChange }) => (<div className="field-group">
    <label htmlFor={id} className="field-label">
      {label}
    </label>

    <select id={id} className="field-select" value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} disabled={disabled}>
      {CURRENCIES.map((currency) => (<option key={currency.code} value={currency.code}>
          {currency.code} · {currency.label}
        </option>))}
    </select>
  </div>);
