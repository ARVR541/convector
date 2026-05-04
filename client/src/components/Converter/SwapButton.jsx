export const SwapButton = ({ disabled, onSwap }) => (<button type="button" className="swap-button" onClick={onSwap} disabled={disabled} aria-label="Поменять выбранные валюты местами">
    ⇄
  </button>);
