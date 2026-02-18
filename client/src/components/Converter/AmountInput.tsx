interface AmountInputProps {
  value: string
  parsedAmount: number | null
  error: string | null
  disabled: boolean
  onChange: (nextValue: string) => void
}

export const AmountInput = ({ value, parsedAmount, error, disabled, onChange }: AmountInputProps) => (
  <div className="field-group">
    <label htmlFor="amount-input" className="field-label">
      Сумма
    </label>

    <input
      id="amount-input"
      className="field-input"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="100"
      inputMode="decimal"
      autoComplete="off"
      aria-label="Сумма для конвертации"
      aria-invalid={Boolean(error)}
      aria-describedby={error ? "amount-error" : "amount-hint"}
      disabled={disabled}
    />

    <p id="amount-hint" className="field-hint">
      Распознанное значение: {parsedAmount === null ? "-" : parsedAmount}
    </p>

    {error ? (
      <p id="amount-error" className="field-error" role="alert">
        {error}
      </p>
    ) : null}
  </div>
)
