import { useEffect, useRef, useState } from "react"

interface WelcomeIntroProps {
  onFinish: () => void
}

// Длительность финального fade-out перед скрытием заставки.
const EXIT_DURATION_MS = 340

// Временные точки появления строк (мс) для последовательной анимации.
const lineAppearanceDelays = [180, 860, 1540]

export const WelcomeIntro = ({ onFinish }: WelcomeIntroProps) => {
  const [visibleLines, setVisibleLines] = useState([false, false, false])
  const [isClosing, setIsClosing] = useState(false)
  // Блокируем повторное завершение, чтобы onFinish не вызвался несколько раз.
  const finishedRef = useRef(false)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const timers: number[] = []

    const finishOnce = () => {
      if (finishedRef.current) {
        return
      }

      finishedRef.current = true
      onFinish()
    }

    // Для пользователей с reduce-motion оставляем короткий, но функциональный сценарий.
    if (prefersReducedMotion) {
      setVisibleLines([true, true, true])
      timers.push(
        window.setTimeout(() => {
          setIsClosing(true)
        }, 900)
      )
      timers.push(window.setTimeout(finishOnce, 900 + EXIT_DURATION_MS))

      return () => {
        timers.forEach((timerId) => window.clearTimeout(timerId))
      }
    }

    // Поочередно открываем строки приветствия.
    lineAppearanceDelays.forEach((delay, index) => {
      timers.push(
        window.setTimeout(() => {
          setVisibleLines((previous) =>
            previous.map((value, lineIndex) => (lineIndex === index ? true : value))
          )
        }, delay)
      )
    })

    // Запускаем автоматическое закрытие заставки после показа всех строк.
    const outroStartDelay = 2860
    timers.push(
      window.setTimeout(() => {
        setIsClosing(true)
      }, outroStartDelay)
    )
    timers.push(window.setTimeout(finishOnce, outroStartDelay + EXIT_DURATION_MS))

    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId))
    }
  }, [onFinish])

  const handleSkip = () => {
    // Skip должен работать только пока интро активно.
    if (isClosing || finishedRef.current) {
      return
    }

    setIsClosing(true)

    window.setTimeout(() => {
      if (finishedRef.current) {
        return
      }

      finishedRef.current = true
      onFinish()
    }, EXIT_DURATION_MS)
  }

  return (
    <div className={`welcome-overlay ${isClosing ? "is-closing" : ""}`.trim()} aria-live="polite">
      <div className="welcome-content">
        <p className={`welcome-line ${visibleLines[0] ? "is-visible" : ""}`.trim()}>Добро пожаловать</p>
        <p className={`welcome-line welcome-subline ${visibleLines[1] ? "is-visible" : ""}`.trim()}>
          Курсовая работа Когутницкого Антона Александровича
        </p>
        <h2 className={`welcome-line welcome-title ${visibleLines[2] ? "is-visible" : ""}`.trim()}>
          Конвектор валют
        </h2>

        <button
          type="button"
          className="welcome-skip"
          onClick={handleSkip}
          aria-label="Пропустить вступительную анимацию"
        >
          Пропустить
        </button>
      </div>
    </div>
  )
}
