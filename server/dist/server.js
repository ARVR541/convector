"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const rates_1 = __importDefault(require("./routes/rates"));
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT ?? 4000);
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"]
}));
app.use(express_1.default.json());
app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: Date.now()
    });
});
app.use("/api/rates", rates_1.default);
app.use((_req, res) => {
    const response = {
        message: "Route not found"
    };
    res.status(404).json(response);
});
app.use((error, _req, res, _next) => {
    logger_1.logger.error("Unhandled server error", error);
    const response = {
        message: "Internal server error",
        details: error.message
    };
    res.status(500).json(response);
});
app.listen(PORT, () => {
    logger_1.logger.info(`Server started on port ${PORT}`);
});
