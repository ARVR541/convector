import type { CurrencyCode } from "../types/domain"
import { CURRENCY_CODES } from "./constants"

const currencySet = new Set<CurrencyCode>(CURRENCY_CODES)

export const isCurrencyCode = (value: string): value is CurrencyCode => currencySet.has(value as CurrencyCode)

export const parseAmountInput = (rawValue: string): number | null => {
  const normalized = rawValue.trim().replace(/\s+/g, "").replace(",", ".")

  if (!normalized) {
    return null
  }

  const parsed = Number(normalized)

  if (!Number.isFinite(parsed)) {
    return null
  }

  return parsed
}

export interface ConversionValidation {
  parsedAmount: number | null
  error: string | null
}

export const validateConversionInput = (
  rawAmount: string,
  fromCurrency: string,
  toCurrency: string
): ConversionValidation => {
  const parsedAmount = parseAmountInput(rawAmount)

  if (parsedAmount === null) {
    return {
      parsedAmount: null,
      error: "Введите корректную сумму"
    }
  }

  if (parsedAmount <= 0) {
    return {
      parsedAmount: null,
      error: "Сумма должна быть больше 0"
    }
  }

  if (!isCurrencyCode(fromCurrency) || !isCurrencyCode(toCurrency)) {
    return {
      parsedAmount: null,
      error: "Выберите корректные валюты"
    }
  }

  return {
    parsedAmount,
    error: null
  }
}
