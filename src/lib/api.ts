import type { Credentials, IncomingNotification } from '../types';
import { cleanApiUrl } from './chat';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const instancePath = (credentials: Credentials) =>
  `${cleanApiUrl(credentials.apiUrl)}/waInstance${encodeURIComponent(credentials.idInstance)}`;

const findErrorDescription = (value: unknown): string | null => {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return null;

  const object = value as Record<string, unknown>;
  for (const key of ['message', 'reason', 'description']) {
    if (typeof object[key] === 'string' && object[key]) return object[key];
  }
  for (const key of ['correspondentsStatus', 'invokeStatus', 'quotaData', 'data']) {
    const nested = findErrorDescription(object[key]);
    if (nested) return nested;
  }
  return null;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const apiDescription = findErrorDescription(data);
    const details = response.status === 466
      ? `Исчерпан лимит тарифа Telegram Developer.${apiDescription ? ` ${apiDescription}` : ''}`
      : apiDescription || `Ошибка API (${response.status})`;
    throw new ApiError(details, response.status);
  }

  return data as T;
};

export const sendMessage = async (
  credentials: Credentials,
  chatId: string,
  message: string,
  signal?: AbortSignal,
) => {
  const response = await fetch(
    `${instancePath(credentials)}/sendMessage/${encodeURIComponent(credentials.apiTokenInstance)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message }),
      signal,
    },
  );
  return parseResponse<{ idMessage: string }>(response);
};

type CheckAccountResponse = {
  exist?: boolean;
  chatId?: string;
  username?: string;
  phoneNumber?: number;
  status?: boolean;
  reason?: string;
};

export const checkAccount = async (
  credentials: Credentials,
  recipient: { phoneNumber: number } | { username: string },
  signal?: AbortSignal,
) => {
  const response = await fetch(
    `${instancePath(credentials)}/checkAccount/${encodeURIComponent(credentials.apiTokenInstance)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipient),
      signal,
    },
  );
  return parseResponse<CheckAccountResponse>(response);
};

export const receiveNotification = async (
  credentials: Credentials,
  signal?: AbortSignal,
) => {
  const response = await fetch(
    `${instancePath(credentials)}/receiveNotification/${encodeURIComponent(credentials.apiTokenInstance)}?receiveTimeout=5`,
    { signal },
  );
  return parseResponse<IncomingNotification | null>(response);
};

export const deleteNotification = async (
  credentials: Credentials,
  receiptId: number,
  signal?: AbortSignal,
) => {
  const response = await fetch(
    `${instancePath(credentials)}/deleteNotification/${encodeURIComponent(credentials.apiTokenInstance)}/${receiptId}`,
    { method: 'DELETE', signal },
  );
  return parseResponse<{ result: boolean; reason?: string }>(response);
};
