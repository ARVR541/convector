import type { CurrencyCode, RatesMeta } from "../../types/domain"
import { CURRENCY_BY_CODE } from "../../utils/constants"
import { formatAmount, formatDate, formatDateTime } from "../../utils/format"

interface ResultPanelProps {
  amount: number | null
  result: number | null
  from: CurrencyCode
  to: CurrencyCode
  ratesMeta: RatesMeta
  rateFrom: number
  rateTo: number
}

export const ResultPanel = ({ amount, result, from, to, ratesMeta, rateFrom, rateTo }: ResultPanelProps) => {
  const convertedRate = rateFrom / rateTo
  const fromSymbol = CURRENCY_BY_CODE[from].symbol
  const toSymbol = CURRENCY_BY_CODE[to].symbol

  if (result === null || amount === null) {
    return (
      <section className="result-panel" aria-live="polite">
        <p className="result-placeholder">Выполните конвертацию, чтобы увидеть результат.</p>
        <p className="result-meta">Дата курсов: {formatDate(ratesMeta.date)}</p>
        <p className="result-meta">Обновлено: {formatDateTime(ratesMeta.lastUpdatedLocalISO)}</p>
      </section>
    )
  }

  return (
    <section className="result-panel" aria-live="polite">
      <p className="result-title">Результат конвертации</p>
      <p className="result-value">
        {formatAmount(result)} {toSymbol} ({to})
      </p>
      <p className="result-subline">
        {formatAmount(amount)} {fromSymbol} ({from}) = {formatAmount(result)} {toSymbol} ({to})
      </p>
      <p className="result-subline">
        1 {from} = {formatAmount(convertedRate, 6)} {to}
      </p>
      <p className="result-meta">Дата курсов: {formatDate(ratesMeta.date)}</p>
      <p className="result-meta">Обновлено: {formatDateTime(ratesMeta.lastUpdatedLocalISO)}</p>
    </section>
  )
}
