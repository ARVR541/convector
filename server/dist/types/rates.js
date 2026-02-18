"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatesFetchError = exports.SUPPORTED_CURRENCIES = void 0;
exports.SUPPORTED_CURRENCIES = ["RUB", "USD", "EUR", "GBP", "CNY", "JPY", "CHF"];
class RatesFetchError extends Error {
    constructor(message, details) {
        super(message);
        this.name = "RatesFetchError";
        this.details = details;
    }
}
exports.RatesFetchError = RatesFetchError;
