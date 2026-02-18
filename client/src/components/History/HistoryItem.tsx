import type { ConversionHistoryItem } from "../../types/domain"
import { CURRENCY_BY_CODE } from "../../utils/constants"
import { formatAmount, formatDateTime } from "../../utils/format"

interface HistoryItemProps {
  item: ConversionHistoryItem
}

export const HistoryItem = ({ item }: HistoryItemProps) => {
  const fromSymbol = CURRENCY_BY_CODE[item.from].symbol
  const toSymbol = CURRENCY_BY_CODE[item.to].symbol

  const crossRate =
    typeof item.rateFrom === "number" && typeof item.rateTo === "number" && item.rateTo > 0
      ? item.rateFrom / item.rateTo
      : null

  return (
    <li className="history-item">
      <details className="history-details">
        <summary className="history-summary">
          <div className="history-main">
            <strong>
              {formatAmount(item.amount)} {fromSymbol} {item.from}
            </strong>
            <span className="history-arrow">→</span>
            <strong>
              {formatAmount(item.result)} {toSymbol} {item.to}
            </strong>
          </div>

          <time dateTime={new Date(item.timestamp).toISOString()} className="history-time">
            {formatDateTime(item.timestamp)}
          </time>
        </summary>

        <div className="history-expanded">
          <p>
            Точная метка времени: <strong>{new Date(item.timestamp).toISOString()}</strong>
          </p>
          <p>
            Точный результат: <strong>{item.result}</strong>
          </p>
          <p>
            Использованный курс для ({item.from}): <strong>{item.rateFrom ?? "н/д"}</strong>
          </p>
          <p>
            Использованный курс для ({item.to}): <strong>{item.rateTo ?? "н/д"}</strong>
          </p>
          <p>
            Кросс-курс: <strong>{crossRate === null ? "н/д" : crossRate}</strong>
          </p>
        </div>
      </details>
    </li>
  )
}
