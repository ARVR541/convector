"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const writeLog = (level, message, ...extra) => {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${level}] ${message}`;
    if (level === "ERROR") {
        console.error(line, ...extra);
        return;
    }
    if (level === "WARN") {
        console.warn(line, ...extra);
        return;
    }
    console.log(line, ...extra);
};
exports.logger = {
    info: (message, ...extra) => writeLog("INFO", message, ...extra),
    warn: (message, ...extra) => writeLog("WARN", message, ...extra),
    error: (message, ...extra) => writeLog("ERROR", message, ...extra)
};
