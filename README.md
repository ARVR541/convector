# Currency Converter

## Обзор проекта
Это full-stack курсовой проект с фронтендом на React + TypeScript и бэкендом на Express + TypeScript.
Приложение конвертирует валюты по курсам Центрального банка России (через backend-proxy), поддерживает локальное кэширование, fallback-поведение, историю конвертаций, сохранение темы и аккуратный доступный UI.

## Технологии
- Frontend: React 18, TypeScript, Vite
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
```
Бэкенд: `http://localhost:4000`

### 2) Фронтенд
```bash
cd client
npm install
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

## Переменные окружения
Для локального запуска `.env` не требуется.

Пример (опционально):
```env
# server/.env (опционально)
PORT=4000
```

## Описание API
### `GET /api/rates`
Возвращает курсы, нормализованные как `RUB per 1 unit` валюты.

Успешный ответ:
```json
{
  "base": "RUB",
  "date": "2026-02-18",
  "timestamp": 1771376831539,
  "rates": {
    "RUB": 1,
    "USD": 76.7389,
    "EUR": 90.8658,
    "GBP": 104.6181,
    "CNY": 11.0934
  }
}
```

Fallback-ответ со stale-данными (если внешний API недоступен, но кэш бэкенда есть):
```json
{
  "base": "RUB",
  "date": "2026-02-18",
  "timestamp": 1771376831539,
  "rates": { "RUB": 1, "USD": 76.7389, "EUR": 90.8658, "GBP": 104.6181, "CNY": 11.0934 },
  "stale": true,
  "error": "CBR request timed out"
}
```

Ответ с ошибкой (если кэша нет и внешний API не ответил):
```json
{
  "message": "Failed to fetch rates from external API",
  "details": "CBR request timed out"
}
```

## Данные в localStorage
Фронтенд сохраняет:
- `currencyRates`: актуальный объект курсов (`Record<CurrencyCode, number>`)
- `ratesMeta`: `{ timestamp, date, lastUpdatedLocalISO }`
- `conversionHistory`: последние 10 операций (сначала новые), включая from/to, amount, raw result, timestamp и использованные курсы
- `currency_converter_user_settings_v1`: настройки пользователя (`theme`, `preferredFrom`, `preferredTo`)

## Чеклист требований курсовой
- ✅ Frontend на React + TypeScript + Vite
- ✅ Backend на Node.js + Express + TypeScript
- ✅ Backend-proxy к CBR JSON (`/api/rates`)
- ✅ Поддержка 5 валют: RUB, USD, EUR, GBP, CNY
- ✅ Формула конвертации по RUB-per-unit (`result = amount * rateFrom / rateTo`)
- ✅ In-memory TTL кэш на бэкенде (1 час)
- ✅ Кэш курсов во frontend localStorage с TTL (1 час)
- ✅ Fallback при ошибке: кэш + warning; без кэша -> error + retry
- ✅ История последних 10 конвертаций в localStorage
- ✅ UI истории с раскрываемыми деталями и подтверждением очистки
- ✅ Валидация суммы и выбранных валют
- ✅ Показ даты курсов и времени последнего локального обновления
- ✅ Loader + toast-уведомления для success/warn/error
- ✅ Тёмная тема по умолчанию + сохранение theme toggle
- ✅ Полировка интерфейса: градиенты, glass-эффект, glow карточек, микро-взаимодействия
- ✅ Доступность: клавиатурный фокус, ARIA-атрибуты, семантическая разметка
- ✅ Якорная навигация в Header: `#converter`, `#history`, `#about`
