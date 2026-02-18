import { Router } from "express"
import { fetchRatesFromCbr } from "../services/cbrService"
import type { ErrorResponse, RatesPayload, RatesResponse } from "../types/rates"
import { ONE_HOUR_MS, TtlCache } from "../utils/cache"
import { logger } from "../utils/logger"

const router = Router()
const cache = new TtlCache<string, RatesPayload>()

const normalizeRequestedDate = (rawDate: unknown): string | null => {
  if (typeof rawDate !== "string") {
    return null
  }

  const trimmed = rawDate.trim()

  if (trimmed.length === 0) {
    return null
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error("Неверный формат даты. Используйте YYYY-MM-DD.")
  }

  const parsed = new Date(`${trimmed}T00:00:00Z`)

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Некорректная дата запроса.")
  }

  const normalized = parsed.toISOString().slice(0, 10)

  if (normalized !== trimmed) {
    throw new Error("Некорректная дата запроса.")
  }

  const today = new Date().toISOString().slice(0, 10)

  if (trimmed > today) {
    throw new Error("Дата не может быть в будущем.")
  }

  return trimmed
}

const cacheKeyForDate = (requestedDate: string | null): string => requestedDate ? `rates:${requestedDate}` : "rates:latest"

const withTimestamp = (payload: RatesPayload): RatesResponse => ({
  ...payload,
  timestamp: Date.now()
})

router.get("/", async (req, res) => {
  let requestedDate: string | null

  try {
    requestedDate = normalizeRequestedDate(req.query.date)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Некорректный параметр date."
    const response: ErrorResponse = {
      message
    }
    res.status(400).json(response)
    return
  }

  const cacheKey = cacheKeyForDate(requestedDate)
  const freshRates = cache.getFresh(cacheKey)

  if (freshRates) {
    res.json(withTimestamp(freshRates))
    return
  }

  try {
    const freshFromApi = await fetchRatesFromCbr(requestedDate ?? undefined)
    cache.set(cacheKey, freshFromApi, ONE_HOUR_MS)

    res.json(withTimestamp(freshFromApi))
    return
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch rates"
    logger.warn("Live rates fetch failed", message)

    const staleRates = cache.getStale(cacheKey)

    if (staleRates) {
      res.json({
        ...withTimestamp(staleRates),
        stale: true,
        error: message
      })
      return
    }

    const response: ErrorResponse = {
      message: "Failed to fetch rates from external API",
      details: message
    }

    res.status(503).json(response)
  }
})

export default router
