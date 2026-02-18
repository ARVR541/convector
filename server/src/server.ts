import cors from "cors"
import express, { type NextFunction, type Request, type Response } from "express"
import ratesRouter from "./routes/rates"
import type { ErrorResponse } from "./types/rates"
import { logger } from "./utils/logger"

const app = express()
const PORT = Number(process.env.PORT ?? 4000)

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"]
  })
)
app.use(express.json())

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: Date.now()
  })
})

app.use("/api/rates", ratesRouter)

app.use((_req, res) => {
  const response: ErrorResponse = {
    message: "Route not found"
  }

  res.status(404).json(response)
})

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error("Unhandled server error", error)

  const response: ErrorResponse = {
    message: "Internal server error",
    details: error.message
  }

  res.status(500).json(response)
})

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`)
})
