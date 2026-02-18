import { useMemo, useState } from "react"
import type { ConversionHistoryItem, CurrencyCode, RatesState, ToastInput } from "../../types/domain"
import { CURRENCY_BY_CODE } from "../../utils/constants"
import { formatAmount } from "../../utils/format"
import { parseAmountInput, validateConversionInput } from "../../utils/validation"
import { AmountInput } from "./AmountInput"
import { CurrencySelect } from "./CurrencySelect"
import { ResultPanel } from "./ResultPanel"
import { SwapButton } from "./SwapButton"

interface ConverterCardProps {
  ratesState: RatesState | null
  disabled: boolean
  initialFrom: CurrencyCode
  initialTo: CurrencyCode
  onRememberPair: (from: CurrencyCode, to: CurrencyCode) => void
  onConverted: (entry: ConversionHistoryItem) => void
  onNotify: (toast: ToastInput) => void
}

const createHistoryId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

export const ConverterCard = ({
  ratesState,
  disabled,
  initialFrom,
  initialTo,
  onRememberPair,
  onConverted,
  onNotify
}: ConverterCardProps) => {
  const [rawAmount, setRawAmount] = useState("1")
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>(initialFrom)
  const [toCurrency, setToCurrency] = useState<CurrencyCode>(initialTo)
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [result, setResult] = useState<number | null>(null)
  const [lastAmount, setLastAmount] = useState<number | null>(null)

  const parsedAmount = useMemo(() => parseAmountInput(rawAmount), [rawAmount])

  const handleFromChange = (currency: CurrencyCode) => {
    setFromCurrency(currency)
    onRememberPair(currency, toCurrency)
  }

  const handleToChange = (currency: CurrencyCode) => {
    setToCurrency(currency)
    onRememberPair(fromCurrency, currency)
  }

  const handleSwap = () => {
    const nextFrom = toCurrency
    const nextTo = fromCurrency

    setFromCurrency(nextFrom)
    setToCurrency(nextTo)
    onRememberPair(nextFrom, nextTo)
  }

  const handleConvert = () => {
    const validation = validateConversionInput(rawAmount, fromCurrency, toCurrency)

    if (validation.error || validation.parsedAmount === null) {
      const message = validation.error ?? "Некорректные данные для конвертации"
      setInlineError(message)

      onNotify({
        kind: "error",
        title: "Ошибка валидации",
        message
      })

      return
    }

    if (!ratesState) {
      const message = "Курсы еще загружаются. Попробуйте снова."
      setInlineError("Курсы пока не загружены")

      onNotify({
        kind: "error",
        title: "Курсы недоступны",
        message
      })

      return
    }

    const rateFrom = ratesState.rates[fromCurrency]
    const rateTo = ratesState.rates[toCurrency]

    if (!Number.isFinite(rateFrom) || !Number.isFinite(rateTo) || rateFrom <= 0 || rateTo <= 0) {
      const message = "Не удалось выполнить конвертацию из-за некорректных курсов."
      setInlineError("Некорректные данные курсов")

      onNotify({
        kind: "error",
        title: "Некорректные курсы",
        message
      })

      return
    }

    const rawResult = validation.parsedAmount * rateFrom / rateTo

    setInlineError(null)
    setResult(rawResult)
    setLastAmount(validation.parsedAmount)

    onConverted({
      id: createHistoryId(),
      from: fromCurrency,
      to: toCurrency,
      amount: validation.parsedAmount,
      result: rawResult,
      timestamp: Date.now(),
      rateFrom,
      rateTo
    })

    onNotify({
      kind: "success",
      title: "Конвертация выполнена",
      message: `${formatAmount(validation.parsedAmount)} ${CURRENCY_BY_CODE[fromCurrency].symbol} -> ${formatAmount(rawResult)} ${CURRENCY_BY_CODE[toCurrency].symbol}`
    })
  }

  return (
    <section className="glass-panel converter-card" id="converter" aria-labelledby="converter-title">
      <div className="panel-head">
        <h2 id="converter-title">Конвертер валют</h2>
        <span className="status-pill" aria-live="polite">
          {disabled ? "Загрузка курсов" : "Готово"}
        </span>
      </div>

      <AmountInput
        value={rawAmount}
        parsedAmount={parsedAmount}
        error={inlineError}
        disabled={disabled}
        onChange={setRawAmount}
      />

      <div className="currency-row">
        <CurrencySelect
          id="from-currency"
          label="Из"
          value={fromCurrency}
          disabled={disabled}
          onChange={handleFromChange}
        />

        <SwapButton disabled={disabled} onSwap={handleSwap} />

        <CurrencySelect
          id="to-currency"
          label="В"
          value={toCurrency}
          disabled={disabled}
          onChange={handleToChange}
        />
      </div>

      <button
        type="button"
        className="primary-button convert-button"
        onClick={handleConvert}
        disabled={disabled}
        aria-label="Конвертировать выбранные валюты"
      >
        Конвертировать
      </button>

      {ratesState ? (
        <ResultPanel
          amount={lastAmount}
          result={result}
          from={fromCurrency}
          to={toCurrency}
          ratesMeta={ratesState.meta}
          rateFrom={ratesState.rates[fromCurrency]}
          rateTo={ratesState.rates[toCurrency]}
        />
      ) : null}
    </section>
  )
}
