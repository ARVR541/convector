import { useCallback, useEffect, useMemo } from "react"
import { DEFAULT_SETTINGS, STORAGE_KEYS } from "../utils/constants"
import type { CurrencyCode, Theme, UserSettings } from "../types/domain"
import { useLocalStorage } from "./useLocalStorage"

const isCurrencyCode = (value: string): value is CurrencyCode =>
  value === "RUB" || value === "USD" || value === "EUR" || value === "GBP" || value === "CNY"

const sanitizeSettings = (value: UserSettings): UserSettings => {
  const theme: Theme = value.theme === "light" ? "light" : "dark"
  const preferredFrom = isCurrencyCode(value.preferredFrom) ? value.preferredFrom : DEFAULT_SETTINGS.preferredFrom
  const preferredTo = isCurrencyCode(value.preferredTo) ? value.preferredTo : DEFAULT_SETTINGS.preferredTo

  return {
    theme,
    preferredFrom,
    preferredTo
  }
}

export const useTheme = () => {
  const [rawSettings, setRawSettings] = useLocalStorage<UserSettings>(STORAGE_KEYS.userSettings, DEFAULT_SETTINGS)

  const settings = useMemo(() => sanitizeSettings(rawSettings), [rawSettings])

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute("data-theme", settings.theme)
    root.classList.toggle("theme-dark", settings.theme === "dark")
    root.classList.toggle("theme-light", settings.theme === "light")
  }, [settings.theme])

  const setTheme = useCallback(
    (theme: Theme) => {
      setRawSettings((previous) => ({
        ...DEFAULT_SETTINGS,
        ...previous,
        theme
      }))
    },
    [setRawSettings]
  )

  const setPreferredPair = useCallback(
    (preferredFrom: CurrencyCode, preferredTo: CurrencyCode) => {
      setRawSettings((previous) => ({
        ...DEFAULT_SETTINGS,
        ...previous,
        preferredFrom,
        preferredTo
      }))
    },
    [setRawSettings]
  )

  const toggleTheme = useCallback(() => {
    setTheme(settings.theme === "dark" ? "light" : "dark")
  }, [setTheme, settings.theme])

  return {
    theme: settings.theme,
    settings,
    setTheme,
    setPreferredPair,
    toggleTheme
  }
}
