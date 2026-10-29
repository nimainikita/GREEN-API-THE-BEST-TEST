import type { Chat, Credentials } from '../types';

const STORAGE_VERSION = 'v1';
const CREDENTIALS_KEY = `telegram-chat:${STORAGE_VERSION}:credentials`;

const storageKey = (idInstance: string) => `telegram-chat:${STORAGE_VERSION}:${idInstance}`;

export const loadChats = (idInstance: string): Chat[] => {
  try {
    const raw = localStorage.getItem(storageKey(idInstance));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Chat[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveChats = (idInstance: string, chats: Chat[]) => {
  try {
    localStorage.setItem(storageKey(idInstance), JSON.stringify(chats));
  } catch {
  }
};

export const loadCredentials = (): Credentials | null => {
  try {
    const raw = sessionStorage.getItem(CREDENTIALS_KEY);
    if (!raw) return null;

    const value = JSON.parse(raw) as Partial<Credentials>;
    if (
      typeof value.apiUrl !== 'string' ||
      typeof value.idInstance !== 'string' ||
      typeof value.apiTokenInstance !== 'string' ||
      !value.apiUrl ||
      !value.idInstance ||
      !value.apiTokenInstance
    ) {
      return null;
    }

    return value as Credentials;
  } catch {
    return null;
  }
};

export const saveCredentials = (credentials: Credentials) => {
  try {
    sessionStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
  } catch {
  }
};

export const clearCredentials = () => {
  try {
    sessionStorage.removeItem(CREDENTIALS_KEY);
  } catch {
  }
};
