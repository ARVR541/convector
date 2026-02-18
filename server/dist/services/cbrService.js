"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRatesFromCbr = void 0;
const rates_1 = require("../types/rates");
const logger_1 = require("../utils/logger");
const CBR_DAILY_URL = "https://www.cbr-xml-daily.ru/daily_json.js";
const REQUEST_TIMEOUT_MS = 8000;
const REQUIRED_FOREIGN_CURRENCIES = rates_1.SUPPORTED_CURRENCIES.filter((currency) => currency !== "RUB");
const normalizeDate = (rawDate) => {
    const directMatch = rawDate.match(/^\d{4}-\d{2}-\d{2}/);
    if (directMatch) {
        return directMatch[0];
    }
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) {
        throw new rates_1.RatesFetchError("Invalid date format in CBR payload", rawDate);
    }
    return parsed.toISOString().slice(0, 10);
};
const toRubPerUnit = (item) => {
    if (item.Nominal <= 0) {
        throw new rates_1.RatesFetchError(`Invalid nominal for ${item.CharCode}`);
    }
    const rubPerUnit = item.Value / item.Nominal;
    if (!Number.isFinite(rubPerUnit) || rubPerUnit <= 0) {
        throw new rates_1.RatesFetchError(`Invalid rate value for ${item.CharCode}`);
    }
    return rubPerUnit;
};
const fetchRatesFromCbr = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        const response = await fetch(CBR_DAILY_URL, {
            method: "GET",
            headers: { Accept: "application/json" },
            signal: controller.signal
        });
        if (!response.ok) {
            throw new rates_1.RatesFetchError("CBR API returned a non-OK status", `HTTP ${response.status}`);
        }
        const payload = (await response.json());
        if (!payload.Valute) {
            throw new rates_1.RatesFetchError("CBR payload is missing Valute field");
        }
        const rawDate = payload.Date ?? payload.PreviousDate;
        if (!rawDate) {
            throw new rates_1.RatesFetchError("CBR payload is missing Date and PreviousDate");
        }
        const valuteByCode = new Map();
        for (const item of Object.values(payload.Valute)) {
            valuteByCode.set(item.CharCode, item);
        }
        const rates = {
            RUB: 1,
            USD: 0,
            EUR: 0,
            GBP: 0,
            CNY: 0
        };
        for (const currencyCode of REQUIRED_FOREIGN_CURRENCIES) {
            const item = valuteByCode.get(currencyCode);
            if (!item) {
                throw new rates_1.RatesFetchError(`Currency ${currencyCode} is missing in CBR response`);
            }
            rates[currencyCode] = toRubPerUnit(item);
        }
        return {
            base: "RUB",
            date: normalizeDate(rawDate),
            rates
        };
    }
    catch (error) {
        if (error instanceof rates_1.RatesFetchError) {
            throw error;
        }
        if (error instanceof Error && error.name === "AbortError") {
            throw new rates_1.RatesFetchError("CBR request timed out");
        }
        logger_1.logger.error("Unexpected CBR fetch error", error);
        throw new rates_1.RatesFetchError("Failed to fetch CBR rates");
    }
    finally {
        clearTimeout(timeoutId);
    }
};
exports.fetchRatesFromCbr = fetchRatesFromCbr;
