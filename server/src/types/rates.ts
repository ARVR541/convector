export const SUPPORTED_CURRENCIES = ["RUB", "USD", "EUR", "GBP", "CNY", "JPY", "CHF"] as const

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]
export type ForeignCurrencyCode = Exclude<CurrencyCode, "RUB">

export interface CbrValuteItem {
  CharCode: string
  Nominal: number
  Name: string
  Value: number
  Previous: number
}

export interface CbrDailyResponse {
  Date?: string
  PreviousDate?: string
  Valute?: Record<string, CbrValuteItem>
}

export interface RatesPayload {
  base: "RUB"
  date: string
  rates: Record<CurrencyCode, number>
}

export interface RatesResponse extends RatesPayload {
  timestamp: number
  stale?: true
  error?: string
}

export interface ErrorResponse {
  message: string
  details?: string
}

export class RatesFetchError extends Error {
  readonly details?: string

  constructor(message: string, details?: string) {
    super(message)
    this.name = "RatesFetchError"
    this.details = details
  }
}
