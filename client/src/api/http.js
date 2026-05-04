export class HttpError extends Error {
  constructor(message, status, details) {
    super(message)
    this.name = "HttpError"
    this.status = status
    this.details = details
  }
}

// Безопасный парсинг: если backend вернул не JSON, не падаем исключением.
const parseJsonSafe = (raw) => {
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const hasCyrillic = (value) => /[А-Яа-яЁё]/.test(value)

// Приводим backend-ошибки к понятным для пользователя сообщениям.
const extractErrorMessage = (payload, status) => {
  if (!payload || typeof payload !== "object") {
    if (status >= 500) {
      return "Сервис курсов временно недоступен"
    }

    return `Ошибка запроса: статус ${status}`
  }

  if ("message" in payload && typeof payload.message === "string") {
    const backendMessage = payload.message

    if (hasCyrillic(backendMessage)) {
      return backendMessage
    }
  }

  if (status === 404) {
    return "Запрошенный ресурс не найден"
  }

  if (status === 408) {
    return "Превышено время ожидания запроса"
  }

  if (status >= 500) {
    return "Сервис курсов временно недоступен"
  }

  return `Ошибка запроса: статус ${status}`
}

export const requestJson = async (url, options = {}) => {
  const { timeoutMs = 9000, headers, ...rest } = options

  // Используем AbortController для унифицированного таймаута fetch.
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...rest,
      headers: {
        Accept: "application/json",
        ...headers
      },
      signal: controller.signal
    })

    const raw = await response.text()
    const payload = parseJsonSafe(raw)

    // Нормализуем non-2xx в типизированную ошибку с HTTP-статусом.
    if (!response.ok) {
      throw new HttpError(extractErrorMessage(payload, response.status), response.status, raw)
    }

    return payload
  } catch (error) {
    // Если уже HttpError — пробрасываем без изменений.
    if (error instanceof HttpError) {
      throw error
    }

    // Отдельно обрабатываем таймаут.
    if (error instanceof Error && error.name === "AbortError") {
      throw new HttpError("Превышено время ожидания запроса", 408)
    }

    // Если в ошибке уже есть русскоязычное сообщение, сохраняем его.
    if (error instanceof Error && hasCyrillic(error.message)) {
      throw new HttpError(error.message, 0)
    }

    // Финальный fallback для сетевых сбоев.
    throw new HttpError("Ошибка сети. Проверьте подключение и повторите попытку.", 0)
  } finally {
    window.clearTimeout(timeoutId)
  }
}
