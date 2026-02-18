export class HttpError extends Error {
  readonly status: number
  readonly details?: string

  constructor(message: string, status: number, details?: string) {
    super(message)
    this.name = "HttpError"
    this.status = status
    this.details = details
  }
}

interface JsonRequestOptions extends RequestInit {
  timeoutMs?: number
}

const parseJsonSafe = (raw: string): unknown => {
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

const hasCyrillic = (value: string): boolean => /[А-Яа-яЁё]/.test(value)

const extractErrorMessage = (payload: unknown, status: number): string => {
  if (!payload || typeof payload !== "object") {
    if (status >= 500) {
      return "Сервис курсов временно недоступен"
    }
    return `Ошибка запроса: статус ${status}`
  }

  if ("message" in payload && typeof (payload as { message: unknown }).message === "string") {
    const backendMessage = (payload as { message: string }).message

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

export const requestJson = async <T>(url: string, options: JsonRequestOptions = {}): Promise<T> => {
  const { timeoutMs = 9000, headers, ...rest } = options

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

    if (!response.ok) {
      throw new HttpError(extractErrorMessage(payload, response.status), response.status, raw)
    }

    return payload as T
  } catch (error) {
    if (error instanceof HttpError) {
      throw error
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new HttpError("Превышено время ожидания запроса", 408)
    }

    if (error instanceof Error && hasCyrillic(error.message)) {
      throw new HttpError(error.message, 0)
    }

    throw new HttpError("Ошибка сети. Проверьте подключение и повторите попытку.", 0)
  } finally {
    window.clearTimeout(timeoutId)
  }
}
