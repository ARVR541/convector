import { CURRENCY_CODES } from "./constants";
const currencySet = new Set(CURRENCY_CODES);
export const isCurrencyCode = (value) => currencySet.has(value);
export const parseAmountInput = (rawValue) => {
    const normalized = rawValue.trim().replace(/\s+/g, "").replace(",", ".");
    if (!normalized) {
        return null;
    }
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) {
        return null;
    }
    return parsed;
};
export const validateConversionInput = (rawAmount, fromCurrency, toCurrency) => {
    const parsedAmount = parseAmountInput(rawAmount);
    if (parsedAmount === null) {
        return {
            parsedAmount: null,
            error: "Введите корректную сумму"
        };
    }
    if (parsedAmount <= 0) {
        return {
            parsedAmount: null,
            error: "Сумма должна быть больше 0"
        };
    }
    if (!isCurrencyCode(fromCurrency) || !isCurrencyCode(toCurrency)) {
        return {
            parsedAmount: null,
            error: "Выберите корректные валюты"
        };
    }
    return {
        parsedAmount,
        error: null
    };
};
