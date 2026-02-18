type LogLevel = "INFO" | "WARN" | "ERROR"

const writeLog = (level: LogLevel, message: string, ...extra: unknown[]): void => {
  const timestamp = new Date().toISOString()
  const line = `[${timestamp}] [${level}] ${message}`

  if (level === "ERROR") {
    console.error(line, ...extra)
    return
  }

  if (level === "WARN") {
    console.warn(line, ...extra)
    return
  }

  console.log(line, ...extra)
}

export const logger = {
  info: (message: string, ...extra: unknown[]) => writeLog("INFO", message, ...extra),
  warn: (message: string, ...extra: unknown[]) => writeLog("WARN", message, ...extra),
  error: (message: string, ...extra: unknown[]) => writeLog("ERROR", message, ...extra)
}
