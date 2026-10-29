# Chat · GREEN-API

Минималистичный чат на React + TypeScript для отправки и получения текстовых сообщений Telegram через GREEN-API.

## Возможности

- подключение по `apiUrl`, `idInstance` и `apiTokenInstance`;
- создание личного чата по номеру РФ/РБ или готовому `chatId`;
- отправка сообщений методом `SendMessage`;
- получение сообщений через очередь `ReceiveNotification` с обязательным подтверждением `DeleteNotification`;
- локальная история чатов без сохранения API-токена;
- поиск по чатам, непрочитанные сообщения и адаптивная мобильная версия.
- удаление чата вместе с его локальной историей.

## Локальный запуск

Требуется Node.js 20+.

```bash
npm install
npm run dev
```

Vite покажет адрес приложения, обычно `http://localhost:5173`.

Проверка проекта:

```bash
npm run build
```

## Настройка GREEN-API

1. Создайте и авторизуйте инстанс Telegram в [личном кабинете GREEN-API](https://console.green-api.com/).
2. В настройках инстанса оставьте `webhookUrl` пустым и включите получение уведомлений о входящих сообщениях.
3. На экране входа укажите `idInstance` и `apiTokenInstance`.
4. Если в кабинете указан отличный от стандартного адрес `apiUrl`, раскройте «Изменить адрес API» и вставьте его.

Токен хранится только в состоянии открытой вкладки. История переписки сохраняется в `localStorage` отдельно для каждого `idInstance`.

## Структура

```text
src/
  components/   UI-компоненты
  lib/api.ts    методы GREEN-API
  lib/chat.ts   преобразование получателей и уведомлений
  lib/storage.ts локальная история
```

Документация: [SendMessage](https://green-api.com/v3/docs/api/sending/SendMessage/), [HTTP API](https://green-api.com/v3/docs/api/receiving/technology-http-api/).
