# Chat · GREEN-API

Минималистичный чат на React + TypeScript для отправки и получения текстовых сообщений Telegram через GREEN-API.

Демо: [green-api-max-phi.vercel.app](https://green-api-max-phi.vercel.app)

## Возможности

- подключение по `apiUrl`, `idInstance` и `apiTokenInstance`;
- создание личного чата по номеру телефона, `@username` или готовому `chatId`;
- проверка получателя методом `CheckAccount`;
- отправка сообщений методом `SendMessage`;
- получение сообщений через очередь `ReceiveNotification` с обязательным подтверждением `DeleteNotification`;
- сохранение входа в пределах вкладки через `sessionStorage`;
- локальная история чатов в `localStorage`;
- поиск по чатам, непрочитанные сообщения и адаптивная мобильная версия;
- удаление чата вместе с его локальной историей.

## Локальный запуск

Требуется Node.js 20.19+ или 22.12+.

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

Данные подключения хранятся в `sessionStorage`: вход сохраняется после перезагрузки и очищается при выходе или закрытии вкладки. История переписки сохраняется в `localStorage` отдельно для каждого `idInstance`.

## Структура

```text
src/
  components/   UI-компоненты
  lib/api.ts    методы GREEN-API
  lib/chat.ts   преобразование получателей и уведомлений
  lib/storage.ts локальная история
```

Документация: [CheckAccount](https://green-api.com/telegram/docs/api/service/CheckAccount/), [SendMessage](https://green-api.com/telegram/docs/api/sending/SendMessage/), [HTTP API](https://green-api.com/telegram/docs/api/receiving/technology-http-api/).
