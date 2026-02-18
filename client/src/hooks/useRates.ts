import { useCallback, useEffect, useMemo, useState } from "react"
import { getRates } from "../api/ratesApi"
import { readStorage, writeStorage } from "../store/storage"
import type { CurrencyCode, CurrencyRates, RatesMeta, RatesState, ToastInput } from "../types/domain"
import { CURRENCY_CODES, RATES_TTL_MS, STORAGE_KEYS } from "../utils/constants"

interface UseRatesOptions {
  notify?: (toast: ToastInput) => void
  requestedDate?: string | null
}

interface UseRatesResult {
  ratesState: RatesState | null
  isLoading: boolean
  error: string | null
  retry: () => Promise<void>
}

type RatesBucket = Record<string, CurrencyRates>
type RatesMetaBucket = Record<string, RatesMeta>
const LATEST_CACHE_KEY = "latest"
const cacheKeyForDate = (requestedDate: string | null | undefined): string => requestedDate ? `date:${requestedDate}` : LATEST_CACHE_KEY

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

const isValidRatesBucket = (value: unknown): value is RatesBucket => {
  if (!value || typeof value !== "object") {
    return false
  }

  return Object.values(value as Record<string, unknown>).every((bucketValue) => isValidRatesObject(bucketValue))
}

const isValidRatesMetaBucket = (value: unknown): value is RatesMetaBucket => {
  if (!value || typeof value !== "object") {
    return false
  }

  return Object.values(value as Record<string, unknown>).every((bucketValue) => isValidRatesMeta(bucketValue))
}

const normalizeRatesBucket = (value: unknown): RatesBucket => {
  if (isValidRatesBucket(value)) {
    return { ...value }
  }

  // Совместимость со старым форматом, где в key хранился только один набор курсов.
  if (isValidRatesObject(value)) {
    return { [LATEST_CACHE_KEY]: value }
  }

  return {}
}

const normalizeRatesMetaBucket = (value: unknown): RatesMetaBucket => {
  if (isValidRatesMetaBucket(value)) {
    return { ...value }
  }

  // Совместимость со старым форматом, где в key хранился только один meta-объект.
  if (isValidRatesMeta(value)) {
    return { [LATEST_CACHE_KEY]: value }
  }

  return {}
}

// Читаем кэш из localStorage только если обе части (rates + meta) валидны для запрошенного cacheKey.
const readCachedRatesState = (cacheKey: string): RatesState | null => {
  const cachedRates = readStorage<unknown>(STORAGE_KEYS.currencyRates, null)
  const cachedMeta = readStorage<unknown>(STORAGE_KEYS.ratesMeta, null)

  if (isValidRatesObject(cachedRates) && isValidRatesMeta(cachedMeta) && cacheKey === LATEST_CACHE_KEY) {
    return {
      rates: cachedRates,
      meta: cachedMeta
    }
  }

  const ratesBucket = normalizeRatesBucket(cachedRates)
  const metaBucket = normalizeRatesMetaBucket(cachedMeta)
  const ratesByKey = ratesBucket[cacheKey]
  const metaByKey = metaBucket[cacheKey]

  if (!ratesByKey || !metaByKey || !isValidRatesObject(ratesByKey) || !isValidRatesMeta(metaByKey)) {
    return null
  }

  return {
    rates: ratesByKey,
    meta: metaByKey
  }
}

// Кэш считается свежим, пока не вышел TTL в 1 час.
const isCacheFresh = (meta: RatesMeta): boolean => Date.now() - meta.timestamp < RATES_TTL_MS

// Единая точка записи кэша, чтобы не дублировать логику по ключам.
const persistRatesState = (cacheKey: string, state: RatesState): void => {
  const rawRates = readStorage<unknown>(STORAGE_KEYS.currencyRates, {})
  const rawMeta = readStorage<unknown>(STORAGE_KEYS.ratesMeta, {})

  const ratesBucket = normalizeRatesBucket(rawRates)
  const metaBucket = normalizeRatesMetaBucket(rawMeta)

  ratesBucket[cacheKey] = state.rates
  metaBucket[cacheKey] = state.meta

  writeStorage(STORAGE_KEYS.currencyRates, ratesBucket)
  writeStorage(STORAGE_KEYS.ratesMeta, metaBucket)
}

export const useRates = ({ notify, requestedDate = null }: UseRatesOptions = {}): UseRatesResult => {
  const [ratesState, setRatesState] = useState<RatesState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Основной сценарий загрузки:
  // 1) пытаемся получить fresh данные с backend,
  // 2) при ошибке откатываемся на fallback-кэш, если он есть,
  // 3) иначе отдаем ошибку в UI.
  const loadRates = useCallback(
    async (fallbackRatesState: RatesState | null, showLoader: boolean): Promise<void> => {
      const cacheKey = cacheKeyForDate(requestedDate)

      if (showLoader) {
        setIsLoading(true)
      }

      try {
        const response = await getRates(requestedDate ?? undefined)

        const nextState: RatesState = {
          rates: response.rates,
          meta: {
            timestamp: response.timestamp,
            date: response.date,
            lastUpdatedLocalISO: new Date().toISOString()
          }
        }

        setRatesState(nextState)
        persistRatesState(cacheKey, nextState)
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
    [notify, requestedDate]
  )

  // При старте и при смене даты сначала быстро показываем local cache по этой дате,
  // затем при необходимости догружаем live.
  useEffect(() => {
    const cacheKey = cacheKeyForDate(requestedDate)
    const cachedState = readCachedRatesState(cacheKey)
    setRatesState(cachedState)
    setError(null)

    if (cachedState) {
      if (isCacheFresh(cachedState.meta)) {
        setIsLoading(false)
        return
      }
    }

    void loadRates(cachedState, true)
  }, [loadRates, requestedDate])

  // Retry использует тот же pipeline, но заново читает fallback из localStorage.
  const retry = useCallback(async () => {
    const cacheKey = cacheKeyForDate(requestedDate)
    const fallbackState = readCachedRatesState(cacheKey)
    await loadRates(fallbackState, true)
  }, [loadRates, requestedDate])

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
