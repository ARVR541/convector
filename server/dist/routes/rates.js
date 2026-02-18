"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cbrService_1 = require("../services/cbrService");
const cache_1 = require("../utils/cache");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
const cache = new cache_1.TtlCache();
const CACHE_KEY = "rates";
const withTimestamp = (payload) => ({
    ...payload,
    timestamp: Date.now()
});
router.get("/", async (_req, res) => {
    const freshRates = cache.getFresh(CACHE_KEY);
    if (freshRates) {
        res.json(withTimestamp(freshRates));
        return;
    }
    try {
        const freshFromApi = await (0, cbrService_1.fetchRatesFromCbr)();
        cache.set(CACHE_KEY, freshFromApi, cache_1.ONE_HOUR_MS);
        res.json(withTimestamp(freshFromApi));
        return;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch rates";
        logger_1.logger.warn("Live rates fetch failed", message);
        const staleRates = cache.getStale(CACHE_KEY);
        if (staleRates) {
            res.json({
                ...withTimestamp(staleRates),
                stale: true,
                error: message
            });
            return;
        }
        const response = {
            message: "Failed to fetch rates from external API",
            details: message
        };
        res.status(503).json(response);
    }
});
exports.default = router;
