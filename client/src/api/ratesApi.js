import { API_BASE_URL, CURRENCY_CODES } from "../utils/constants";
import { HttpError, requestJson } from "./http";
const hasValidRates = (rates) => {
    if (!rates || typeof rates !== "object") {
        return false;
    }
    return CURRENCY_CODES.every((code) => {
        const value = rates[code];
        return typeof value === "number" && Number.isFinite(value) && value > 0;
    });
};
const assertRatesPayload = (payload) => {
    if (!payload || typeof payload !== "object") {
        throw new HttpError("Некорректный формат ответа с курсами", 500);
    }
    const candidate = payload;
    if (candidate.base !== "RUB") {
        throw new HttpError("Неподдерживаемая базовая валюта курсов", 500);
    }
    if (typeof candidate.date !== "string" || candidate.date.length === 0) {
        throw new HttpError("В ответе отсутствует дата курсов", 500);
    }
    if (typeof candidate.timestamp !== "number" || !Number.isFinite(candidate.timestamp)) {
        throw new HttpError("Некорректная метка времени курсов", 500);
    }
    if (!hasValidRates(candidate.rates)) {
        throw new HttpError("Некорректный объект курсов", 500);
    }
    return {
        base: "RUB",
        date: candidate.date,
        timestamp: candidate.timestamp,
        rates: candidate.rates,
        stale: candidate.stale,
        error: candidate.error
    };
};
export const getRates = async (requestedDate) => {
    const searchParams = new URLSearchParams();
    if (requestedDate) {
        searchParams.set("date", requestedDate);
    }
    const requestUrl = searchParams.size > 0 ? `${API_BASE_URL}/rates?${searchParams.toString()}` : `${API_BASE_URL}/rates`;
    const payload = await requestJson(requestUrl, {
        method: "GET"
    });
    return assertRatesPayload(payload);
};
