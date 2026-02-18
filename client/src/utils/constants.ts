import type { CurrencyInfo, CurrencyCode, NavLinkItem, UserSettings } from "../types/domain"

export const API_BASE_URL = "/api"
export const RATES_TTL_MS = 60 * 60 * 1000
export const MAX_HISTORY_ITEMS = 10

export const STORAGE_KEYS = {
  userSettings: "currency_converter_user_settings_v1",
  currencyRates: "currencyRates",
  ratesMeta: "ratesMeta",
  conversionHistory: "conversionHistory"
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "RUB", label: "Российский рубль", symbol: "₽" },
  { code: "USD", label: "Доллар США", symbol: "$" },
  { code: "EUR", label: "Евро", symbol: "€" },
  { code: "GBP", label: "Фунт стерлингов", symbol: "£" },
  { code: "CNY", label: "Китайский юань", symbol: "¥" },
  { code: "JPY", label: "Японская иена", symbol: "¥" },
  { code: "CHF", label: "Швейцарский франк", symbol: "₣" }
]

export const CURRENCY_CODES: CurrencyCode[] = CURRENCIES.map((currency) => currency.code)

export const CURRENCY_BY_CODE: Record<CurrencyCode, CurrencyInfo> = {
  RUB: CURRENCIES[0],
  USD: CURRENCIES[1],
  EUR: CURRENCIES[2],
  GBP: CURRENCIES[3],
  CNY: CURRENCIES[4],
  JPY: CURRENCIES[5],
  CHF: CURRENCIES[6]
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: "dark",
  preferredFrom: "USD",
  preferredTo: "RUB"
}

export const HEADER_NAV_LINKS: NavLinkItem[] = [
  { path: "/", label: "Конвертер" },
  { path: "/history", label: "История" },
  { path: "/about", label: "О проекте" }
]
