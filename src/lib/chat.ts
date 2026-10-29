import type { Chat, IncomingNotification } from '../types';

export const cleanApiUrl = (value: string) => value.trim().replace(/\/+$/, '');

export const normalizeRecipient = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^@[a-zA-Z0-9_]{5,32}$/.test(trimmed)) return trimmed;
  if (/^\d{7,16}@c\.us$/i.test(trimmed)) return trimmed.toLowerCase();

  const digits = trimmed.replace(/\D/g, '');
  if ((trimmed.startsWith('+') || /[\s()-]/.test(trimmed)) && /^\d{8,15}$/.test(digits)) {
    return `${digits}@c.us`;
  }
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return `7${digits.slice(1)}@c.us`;
  }
  if (digits.length === 12 && digits.startsWith('375')) {
    return `${digits}@c.us`;
  }
  if (/^-?\d{5,16}$/.test(trimmed)) return trimmed;
  return null;
};

export const formatRecipient = (chatId: string): string => {
  const phone = chatId.replace(/@c\.us$/i, '');
  if (/^7\d{10}$/.test(phone)) {
    return `+7 ${phone.slice(1, 4)} ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9)}`;
  }
  if (/^375\d{9}$/.test(phone)) {
    return `+375 ${phone.slice(3, 5)} ${phone.slice(5, 8)}-${phone.slice(8, 10)}-${phone.slice(10)}`;
  }
  return chatId;
};

export const initialsFor = (value: string) => {
  const letters = value
    .replace(/@.*$/, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return letters || 'M';
};

export const notificationToChat = (notification: IncomingNotification): Chat | null => {
  const { body } = notification;
  const text = body.messageData?.textMessageData?.textMessage;
  const chatId = body.senderData?.chatId ?? body.senderData?.sender;

  if (
    body.typeWebhook !== 'incomingMessageReceived' ||
    body.messageData?.typeMessage !== 'textMessage' ||
    !text ||
    !chatId
  ) {
    return null;
  }

  const title =
    body.senderData?.chatName ||
    body.senderData?.senderContactName ||
    body.senderData?.senderName ||
    formatRecipient(chatId);
  const timestamp = (body.timestamp ?? Math.floor(Date.now() / 1000)) * 1000;

  return {
    id: chatId,
    title,
    subtitle: body.senderData?.senderPhoneNumber
      ? `+${body.senderData.senderPhoneNumber}`
      : formatRecipient(chatId),
    unread: 1,
    updatedAt: timestamp,
    messages: [
      {
        id: body.idMessage ?? `incoming-${notification.receiptId}`,
        chatId,
        text,
        direction: 'incoming',
        timestamp,
      },
    ],
  };
};
