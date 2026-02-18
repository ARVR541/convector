interface RateDateInputProps {
  value: string
  maxDate: string
  disabled: boolean
  onChange: (nextDate: string) => void
}

export const RateDateInput = ({ value, maxDate, disabled, onChange }: RateDateInputProps) => (
  <div className="field-group">
    <label htmlFor="rates-date-input" className="field-label">
      Дата курса
    </label>

    <div className="date-row">
      <input
        id="rates-date-input"
        type="date"
        className="field-input"
        value={value}
        max={maxDate}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-label="Выберите дату курса"
      />

      <button
        type="button"
        className="secondary-button date-today-button"
        onClick={() => onChange("")}
        disabled={disabled || value.length === 0}
        aria-label="Сбросить дату и использовать актуальные курсы"
      >
        Актуальные
      </button>
    </div>
  </div>
)

