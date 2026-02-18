import { useState } from "react"
import type { ConversionHistoryItem } from "../../types/domain"
import { HistoryItem } from "./HistoryItem"

interface HistoryPanelProps {
  items: ConversionHistoryItem[]
  onClearHistory: () => void
}

export const HistoryPanel = ({ items, onClearHistory }: HistoryPanelProps) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const handleClearClick = () => {
    setIsConfirmOpen(true)
  }

  const handleConfirmClear = () => {
    onClearHistory()
    setIsConfirmOpen(false)
  }

  const handleCancelClear = () => {
    setIsConfirmOpen(false)
  }

  return (
    <section className="glass-panel history-card" id="history" aria-labelledby="history-title">
      <div className="history-head">
        <h2 id="history-title">История конвертаций</h2>

        <button
          type="button"
          className="danger-button"
          onClick={handleClearClick}
          disabled={items.length === 0}
          aria-label="Очистить историю конвертаций"
        >
          Очистить историю
        </button>
      </div>

      {isConfirmOpen ? (
        <div className="history-confirm" role="alertdialog" aria-live="assertive" aria-label="Подтверждение очистки истории">
          <p>Вы уверены, что хотите удалить всю историю?</p>
          <div className="history-confirm-actions">
            <button type="button" className="danger-button" onClick={handleConfirmClear}>
              Подтвердить
            </button>
            <button type="button" className="secondary-button" onClick={handleCancelClear}>
              Отмена
            </button>
          </div>
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="history-empty">Пока нет конвертаций. Здесь появятся последние 10 успешных операций.</p>
      ) : (
        <ul className="history-list">
          {items.map((item) => (
            <HistoryItem key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  )
}
