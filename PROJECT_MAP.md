# Карта проекта (основные файлы)

## 1) Общая структура
- `client/` — фронтенд (React + TypeScript + Vite)
- `server/` — бэкенд (Node.js + Express + TypeScript)

## 2) Основной поток работы
1. Пользователь открывает фронтенд (`client/index.html` -> `client/src/main.tsx`).
2. Корневой UI собирается в `client/src/App.tsx`.
3. Хук `client/src/hooks/useRates.ts` берет курсы:
   - сначала из `localStorage` (по ключу даты),
   - затем из backend `GET /api/rates` (или `GET /api/rates?date=YYYY-MM-DD`).
4. Бэкенд (`server/src/routes/rates.ts`) отдает:
   - свежий кэш из памяти (по ключу даты), или
   - данные из ЦБ через `server/src/services/cbrService.ts`.
5. Конвертация выполняется на фронтенде в `client/src/components/Converter/ConverterCard.tsx`.

## 3) Frontend — ключевые файлы

### Точка входа и каркас
- `client/index.html` — HTML-оболочка приложения.
- `client/src/main.tsx` — монтирование React-приложения.
- `client/src/App.tsx` — роутинг страниц (`/`, `/history`, `/about`), сборка экрана, интро, передача состояния.
- `client/src/styles/globals.css` — тема, фон, анимации, глобальные стили.

### Главные UI-компоненты
- `client/src/components/Layout/Header.tsx` — хедер, навигация, переключатель темы.
- `client/src/components/Layout/Footer.tsx` — футер.
- `client/src/components/Converter/ConverterCard.tsx` — логика конвертации и отправка в историю.
- `client/src/components/Converter/RateDateInput.tsx` — выбор даты для исторических курсов.
- `client/src/components/History/HistoryPanel.tsx` — список последних операций и очистка истории.
- `client/src/components/UI/WelcomeIntro.tsx` — вступительная анимация.

### Хуки и состояние
- `client/src/hooks/useRates.ts` — загрузка курсов с поддержкой выбранной даты, TTL-кэш, fallback, retry.
- `client/src/hooks/useTheme.ts` — dark/light тема + сохранение в `localStorage`.
- `client/src/hooks/useToast.ts` — уведомления (toast).
- `client/src/hooks/useLocalStorage.ts` — универсальный хук сохранения состояния.

### API и утилиты
- `client/src/api/http.ts` — fetch-обертка, таймаут, нормализация ошибок.
- `client/src/api/ratesApi.ts` — запрос и валидация ответа `/api/rates`.
- `client/src/store/storage.ts` — безопасная работа с `localStorage`.
- `client/src/utils/constants.ts` — константы приложения (7 валют, ключи, TTL).
- `client/src/utils/validation.ts` — валидация суммы/валют.
- `client/src/utils/format.ts` — форматирование чисел и дат.
- `client/src/types/domain.ts` — доменные типы фронтенда.

## 4) Backend — ключевые файлы
- `server/src/server.ts` — запуск Express, middleware, подключение роутов.
- `server/src/routes/rates.ts` — `GET /api/rates` + опциональный `date`, кэш-логика, fallback на stale.
- `server/src/services/cbrService.ts` — запрос в ЦБ РФ (текущий/архивный endpoint) и нормализация `rubPerUnit`.
- `server/src/utils/cache.ts` — in-memory TTL cache (1 час).
- `server/src/utils/logger.ts` — простой логгер.
- `server/src/types/rates.ts` — типы ответов и структуры CBR.

## 5) Где хранится пользовательские данные
- `currencyRates` — кэш курсов по ключам даты (`latest`, `date:YYYY-MM-DD`).
- `ratesMeta` — дата/время обновления по ключам даты.
- `conversionHistory` — последние 10 конвертаций.
- `currency_converter_user_settings_v1` — тема и предпочитаемая валютная пара.

## 6) С чего читать проект новому разработчику
1. `client/src/App.tsx`
2. `client/src/hooks/useRates.ts`
3. `client/src/components/Converter/ConverterCard.tsx`
4. `server/src/routes/rates.ts`
5. `server/src/services/cbrService.ts`
