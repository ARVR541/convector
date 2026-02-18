import { useCallback, useEffect, useMemo, useState } from "react"
import { getRates } from "../api/ratesApi"
import { readStorage, writeStorage } from "../store/storage"
import type { CurrencyCode, CurrencyRates, RatesMeta, RatesState, ToastInput } from "../types/domain"
import { CURRENCY_CODES, RATES_TTL_MS, STORAGE_KEYS } from "../utils/constants"

interface UseRatesOptions {
  notify?: (toast: ToastInput) => void
}

interface UseRatesResult {
  ratesState: RatesState | null
  isLoading: boolean
  error: string | null
  retry: () => Promise<void>
}

// Проверяем, что в кеше действительно все поддерживаемые валюты и корректные числа > 0.
const isValidRatesObject = (value: unknown): value is CurrencyRates => {
  if (!value || typeof value !== "object") {
    return false
  }

  return CURRENCY_CODES.every((currencyCode) => {
    const rate = (value as Record<CurrencyCode, unknown>)[currencyCode]
    return typeof rate === "number" && Number.isFinite(rate) && rate > 0
  })
}

// Метаданные кэша нужны для TTL и отображения "дата курсов / когда обновлено локально".
const isValidRatesMeta = (value: unknown): value is RatesMeta => {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Partial<RatesMeta>

  return (
    typeof candidate.timestamp === "number" &&
    Number.isFinite(candidate.timestamp) &&
    typeof candidate.date === "string" &&
    candidate.date.length > 0 &&
    typeof candidate.lastUpdatedLocalISO === "string" &&
    candidate.lastUpdatedLocalISO.length > 0
  )
}

// Читаем кэш из localStorage только если обе части (rates + meta) валидны.
const readCachedRatesState = (): RatesState | null => {
  const cachedRates = readStorage<unknown>(STORAGE_KEYS.currencyRates, null)
  const cachedMeta = readStorage<unknown>(STORAGE_KEYS.ratesMeta, null)

  if (!isValidRatesObject(cachedRates) || !isValidRatesMeta(cachedMeta)) {
    return null
  }

  return {
    rates: cachedRates,
    meta: cachedMeta
  }
}

// Кэш считается свежим, пока не вышел TTL в 1 час.
const isCacheFresh = (meta: RatesMeta): boolean => Date.now() - meta.timestamp < RATES_TTL_MS

// Единая точка записи кэша, чтобы не дублировать логику по ключам.
const persistRatesState = (state: RatesState): void => {
  writeStorage(STORAGE_KEYS.currencyRates, state.rates)
  writeStorage(STORAGE_KEYS.ratesMeta, state.meta)
}

export const useRates = ({ notify }: UseRatesOptions = {}): UseRatesResult => {
  const [ratesState, setRatesState] = useState<RatesState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Основной сценарий загрузки:
  // 1) пытаемся получить fresh данные с backend,
  // 2) при ошибке откатываемся на fallback-кэш, если он есть,
  // 3) иначе отдаем ошибку в UI.
  const loadRates = useCallback(
    async (fallbackRatesState: RatesState | null, showLoader: boolean): Promise<void> => {
      if (showLoader) {
        setIsLoading(true)
      }

      try {
        const response = await getRates()

        const nextState: RatesState = {
          rates: response.rates,
          meta: {
            timestamp: response.timestamp,
            date: response.date,
            lastUpdatedLocalISO: new Date().toISOString()
          }
        }

        setRatesState(nextState)
        persistRatesState(nextState)
        setError(null)

        if (response.stale) {
          notify?.({
            kind: "warn",
            title: "Используется кэш курсов",
            message: response.error ?? "Бэкенд вернул устаревшие кэшированные курсы."
          })
        }
      } catch (requestError) {
        if (fallbackRatesState) {
          setRatesState(fallbackRatesState)
          setError(null)

          notify?.({
            kind: "warn",
            title: "Используется кэш курсов",
            message: "Используются курсы из локального кэша."
          })
        } else {
          const message = requestError instanceof Error ? requestError.message : "Не удалось получить курсы валют"
          setError(message)

          notify?.({
            kind: "error",
            title: "Курсы недоступны",
            message
          })
        }
      } finally {
        setIsLoading(false)
      }
    },
    [notify]
  )

  // При старте сначала быстро показываем local cache, затем при необходимости догружаем live.
  useEffect(() => {
    const cachedState = readCachedRatesState()

    if (cachedState) {
      setRatesState(cachedState)

      if (isCacheFresh(cachedState.meta)) {
        setIsLoading(false)
        return
      }
    }

    void loadRates(cachedState, true)
  }, [loadRates])

  // Retry использует тот же pipeline, но заново читает fallback из localStorage.
  const retry = useCallback(async () => {
    const fallbackState = readCachedRatesState()
    await loadRates(fallbackState, true)
  }, [loadRates])

  return useMemo(
    () => ({
      ratesState,
      isLoading,
      error,
      retry
    }),
    [ratesState, isLoading, error, retry]
  )
}
