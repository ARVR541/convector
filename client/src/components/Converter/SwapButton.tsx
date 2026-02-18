interface SwapButtonProps {
  disabled: boolean
  onSwap: () => void
}

export const SwapButton = ({ disabled, onSwap }: SwapButtonProps) => (
  <button
    type="button"
    className="swap-button"
    onClick={onSwap}
    disabled={disabled}
    aria-label="Поменять выбранные валюты местами"
  >
    ⇄
  </button>
)
