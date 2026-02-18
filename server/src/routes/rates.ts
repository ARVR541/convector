import { Router } from "express"
import { fetchRatesFromCbr } from "../services/cbrService"
import type { ErrorResponse, RatesPayload, RatesResponse } from "../types/rates"
import { ONE_HOUR_MS, TtlCache } from "../utils/cache"
import { logger } from "../utils/logger"

const router = Router()
const cache = new TtlCache<string, RatesPayload>()
const CACHE_KEY = "rates"

const withTimestamp = (payload: RatesPayload): RatesResponse => ({
  ...payload,
  timestamp: Date.now()
})

router.get("/", async (_req, res) => {
  const freshRates = cache.getFresh(CACHE_KEY)

  if (freshRates) {
    res.json(withTimestamp(freshRates))
    return
  }

  try {
    const freshFromApi = await fetchRatesFromCbr()
    cache.set(CACHE_KEY, freshFromApi, ONE_HOUR_MS)

    res.json(withTimestamp(freshFromApi))
    return
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch rates"
    logger.warn("Live rates fetch failed", message)

    const staleRates = cache.getStale(CACHE_KEY)

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
