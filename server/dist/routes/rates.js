"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cbrService_1 = require("../services/cbrService");
const cache_1 = require("../utils/cache");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
const cache = new cache_1.TtlCache();
const normalizeRequestedDate = (rawDate) => {
    if (typeof rawDate !== "string") {
        return null;
    }
    const trimmed = rawDate.trim();
    if (trimmed.length === 0) {
        return null;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        throw new Error("Неверный формат даты. Используйте YYYY-MM-DD.");
    }
    const parsed = new Date(`${trimmed}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) {
        throw new Error("Некорректная дата запроса.");
    }
    const normalized = parsed.toISOString().slice(0, 10);
    if (normalized !== trimmed) {
        throw new Error("Некорректная дата запроса.");
    }
    const today = new Date().toISOString().slice(0, 10);
    if (trimmed > today) {
        throw new Error("Дата не может быть в будущем.");
    }
    return trimmed;
};
const cacheKeyForDate = (requestedDate) => requestedDate ? `rates:${requestedDate}` : "rates:latest";
const withTimestamp = (payload) => ({
    ...payload,
    timestamp: Date.now()
});
router.get("/", async (req, res) => {
    let requestedDate;
    try {
        requestedDate = normalizeRequestedDate(req.query.date);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Некорректный параметр date.";
        const response = {
            message
        };
        res.status(400).json(response);
        return;
    }
    const cacheKey = cacheKeyForDate(requestedDate);
    const freshRates = cache.getFresh(cacheKey);
    if (freshRates) {
        res.json(withTimestamp(freshRates));
        return;
    }
    try {
        const freshFromApi = await (0, cbrService_1.fetchRatesFromCbr)(requestedDate ?? undefined);
        cache.set(cacheKey, freshFromApi, cache_1.ONE_HOUR_MS);
        res.json(withTimestamp(freshFromApi));
        return;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch rates";
        logger_1.logger.warn("Live rates fetch failed", message);
        const staleRates = cache.getStale(cacheKey);
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
