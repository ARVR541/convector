# Конвектор валют

## Обзор проекта
Это full-stack курсовой проект с фронтендом на React + JSX и бэкендом на Express + TypeScript.
Приложение конвертирует валюты по курсам Центрального банка России (через backend-proxy), поддерживает локальное кэширование, fallback-поведение, историю конвертаций, сохранение темы, выбор исторической даты курса и аккуратный доступный UI.

## Технологии
- Frontend: React 18, JSX, Vite
- Backend: Node.js, Express, TypeScript
- Источник API: JSON ЦБ РФ (`https://www.cbr-xml-daily.ru/daily_json.js`)
- Хранение: `localStorage` в браузере + in-memory TTL кэш на бэкенде

## Структура репозитория
```text
currency-converter/
  server/
  client/
  README.md
```

## Инструкция по запуску
Откройте два терминала в корне проекта.

### 1) Бэкенд
```bash
cd server
npm install
npm run dev
cd /Users/ariver/Documents/коды/Конвектор/currency-converter/server
npm run dev
```

Бэкенд: `http://localhost:4000`

### 2) Фронтенд
```bash
cd client
npm install
npm run dev
cd /Users/ariver/Documents/коды/Конвектор/currency-converter/client
npm run dev
```

Фронтенд: `http://localhost:5173`

### Сборка для production
```bash
# backend
cd server && npm run build && npm start

# frontend
cd client && npm run build && npm run preview
```
