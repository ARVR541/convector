export type CurrencyCode = "RUB" | "USD" | "EUR" | "GBP" | "CNY" | "JPY" | "CHF"
export type Theme = "dark" | "light"
export type AppRoute = "/" | "/history" | "/about"

export interface CurrencyInfo {
  code: CurrencyCode
  label: string
  symbol: string
}

export interface UserSettings {
  theme: Theme
  preferredFrom: CurrencyCode
  preferredTo: CurrencyCode
}

export type CurrencyRates = Record<CurrencyCode, number>

export interface RatesMeta {
  timestamp: number
  date: string
  lastUpdatedLocalISO: string
}

export interface RatesResponse {
  base: "RUB"
  date: string
  timestamp: number
  rates: CurrencyRates
  stale?: true
  error?: string
}

export interface RatesState {
  rates: CurrencyRates
  meta: RatesMeta
}

export interface ConversionHistoryItem {
  id: string
  from: CurrencyCode
  to: CurrencyCode
  amount: number
  result: number
  timestamp: number
  rateFrom?: number
  rateTo?: number
}

export type ToastKind = "success" | "error" | "warn" | "info"

export interface ToastMessage {
  id: string
  kind: ToastKind
  title: string
  message: string
  durationMs?: number
}

export type ToastInput = Omit<ToastMessage, "id">

export interface NavLinkItem {
  path: AppRoute
  label: string
}
