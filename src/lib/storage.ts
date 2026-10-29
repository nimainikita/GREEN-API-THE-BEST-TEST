import type { Chat } from '../types';

const STORAGE_VERSION = 'v1';

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
