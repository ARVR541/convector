import { useCallback, useEffect, useMemo, useState } from "react"
import { ConverterCard } from "./components/Converter/ConverterCard"
import { HistoryPanel } from "./components/History/HistoryPanel"
import { Footer } from "./components/Layout/Footer"
import { Header } from "./components/Layout/Header"
import { ErrorState } from "./components/UI/ErrorState"
import { Loader } from "./components/UI/Loader"
import { SectionReveal } from "./components/UI/SectionReveal"
import { ToastHost } from "./components/UI/ToastHost"
import { WelcomeIntro } from "./components/UI/WelcomeIntro"
import { useLocalStorage } from "./hooks/useLocalStorage"
import { useRates } from "./hooks/useRates"
import { useTheme } from "./hooks/useTheme"
import { useToast } from "./hooks/useToast"
import type { AppRoute, ConversionHistoryItem, CurrencyCode } from "./types/domain"
import { HEADER_NAV_LINKS, MAX_HISTORY_ITEMS, STORAGE_KEYS } from "./utils/constants"

// Генерация устойчивого id для истории: используем crypto UUID, а при отсутствии — fallback.
const createHistoryId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

// Нормализуем историю перед отображением/сохранением:
// 1) фильтруем битые записи, 2) гарантируем наличие id, 3) ограничиваем до последних 10.
const normalizeHistory = (history: ConversionHistoryItem[]): ConversionHistoryItem[] =>
  history
    .filter((item) => Number.isFinite(item.amount) && Number.isFinite(item.result) && Number.isFinite(item.timestamp))
    .map((item) => ({
      ...item,
      id: item.id || createHistoryId()
    }))
    .slice(0, MAX_HISTORY_ITEMS)

// Приводим путь к одному из поддерживаемых роутов приложения.
const normalizeRoute = (pathname: string): AppRoute => {
  if (pathname === "/history") {
    return "/history"
  }

  if (pathname === "/about") {
    return "/about"
  }

  return "/"
}

const getCurrentRoute = (): AppRoute => {
  if (typeof window === "undefined") {
    return "/"
  }

  return normalizeRoute(window.location.pathname)
}

const App = () => {
  const { theme, settings, setPreferredPair, toggleTheme } = useTheme()
  const { toasts, pushToast, removeToast } = useToast()
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getCurrentRoute)
  const [isIntroFinished, setIsIntroFinished] = useState(false)

  const { ratesState, isLoading, error, retry } = useRates({
    notify: pushToast
  })

  const [history, setHistory] = useLocalStorage<ConversionHistoryItem[]>(STORAGE_KEYS.conversionHistory, [])

  const normalizedHistory = useMemo(() => normalizeHistory(history), [history])

  // Если в localStorage попали нестабильные записи, приводим их к валидному виду один раз.
  useEffect(() => {
    if (normalizedHistory.length !== history.length || normalizedHistory.some((item, index) => item.id !== history[index]?.id)) {
      setHistory(normalizedHistory)
    }
  }, [normalizedHistory, history, setHistory])

  // Синхронизация ручного роутинга с адресной строкой и кнопками браузера Back/Forward.
  useEffect(() => {
    const nextRoute = normalizeRoute(window.location.pathname)

    if (window.location.pathname !== nextRoute) {
      window.history.replaceState({}, "", nextRoute)
    }

    setCurrentRoute(nextRoute)

    const handlePopState = () => {
      setCurrentRoute(normalizeRoute(window.location.pathname))
    }

    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [setCurrentRoute])

  // После успешной конвертации добавляем запись в начало истории и снова ограничиваем размер.
  const handleConverted = useCallback(
    (entry: ConversionHistoryItem) => {
      setHistory((previousHistory) => [entry, ...normalizeHistory(previousHistory)].slice(0, MAX_HISTORY_ITEMS))
    },
    [setHistory]
  )

  const handleClearHistory = useCallback(() => {
    setHistory([])
    pushToast({
      kind: "info",
      title: "История очищена",
      message: "Все записи истории конвертаций удалены."
    })
  }, [pushToast, setHistory])

  const handleRememberPair = useCallback(
    (from: CurrencyCode, to: CurrencyCode) => {
      setPreferredPair(from, to)
    },
    [setPreferredPair]
  )

  const handleRetry = useCallback(() => {
    void retry()
  }, [retry])

  // Навигация без перезагрузки страницы: pushState + обновление состояния + прокрутка вверх.
  const navigate = useCallback(
    (nextRoute: AppRoute) => {
      if (nextRoute === currentRoute) {
        return
      }

      window.history.pushState({}, "", nextRoute)
      setCurrentRoute(nextRoute)
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
    [currentRoute, setCurrentRoute]
  )

  // Критическую ошибку показываем только на странице конвертера, где нужны курсы.
  const hasFatalError = Boolean(error && !ratesState && currentRoute === "/")

  return (
    <div className="app-root" data-theme={theme}>
      {/* Полноэкранная вступительная заставка. После завершения открывает основной UI. */}
      {isIntroFinished ? null : <WelcomeIntro onFinish={() => setIsIntroFinished(true)} />}

      <div className={`app-shell ${isIntroFinished ? "is-ready" : "is-hidden"}`.trim()} aria-hidden={!isIntroFinished}>
        <Header
          theme={theme}
          navItems={HEADER_NAV_LINKS}
          currentPath={currentRoute}
          onNavigate={navigate}
          onToggleTheme={toggleTheme}
        />

        <main className="app-main">
          {/* Страница конвертера */}
          {currentRoute === "/" ? (
            <>
              {isLoading ? <Loader label="Загрузка курсов..." /> : null}

              {hasFatalError ? (
                <ErrorState
                  title="Курсы недоступны"
                  message={error ?? "Не удалось загрузить курсы валют."}
                  onRetry={handleRetry}
                  isRetrying={isLoading}
                />
              ) : (
                <SectionReveal delayMs={80}>
                  <ConverterCard
                    ratesState={ratesState}
                    disabled={isLoading || !ratesState}
                    initialFrom={settings.preferredFrom}
                    initialTo={settings.preferredTo}
                    onRememberPair={handleRememberPair}
                    onConverted={handleConverted}
                    onNotify={pushToast}
                  />
                </SectionReveal>
              )}
            </>
          ) : null}

          {/* Отдельная страница истории */}
          {currentRoute === "/history" ? (
            <SectionReveal delayMs={80}>
              <HistoryPanel items={normalizedHistory} onClearHistory={handleClearHistory} />
            </SectionReveal>
          ) : null}

          {/* Информационная страница о проекте и источнике данных */}
          {currentRoute === "/about" ? (
            <SectionReveal delayMs={80}>
              <section className="glass-panel about-card" id="about" aria-labelledby="about-title">
                <h2 id="about-title">О проекте</h2>
                <p>
                  Курсы загружаются с бэкенд-эндпоинта <code>/api/rates</code>, который проксирует API ЦБ РФ
                  <code> https://www.cbr-xml-daily.ru/daily_json.js</code>.
                </p>
                <p>
                  Стратегия кэширования: бэкенд хранит данные в памяти с TTL 1 час, фронтенд использует localStorage
                  ключи <code>currencyRates</code> и <code>ratesMeta</code> также с TTL 1 час.
                </p>
                <p>
                  Резервный офлайн-сценарий: если запрос по сети не удался, используются кэшированные курсы с
                  предупреждением. Если кэша нет, приложение показывает состояние ошибки с кнопкой повтора.
                </p>
              </section>
            </SectionReveal>
          ) : null}
        </main>

        <Footer />
      </div>

      <ToastHost toasts={toasts} onClose={removeToast} />
    </div>
  )
}

export default App
