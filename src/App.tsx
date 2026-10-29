import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { ChatView } from './components/ChatView';
import { LoginScreen } from './components/LoginScreen';
import { NewChatDialog } from './components/NewChatDialog';
import { Sidebar } from './components/Sidebar';
import { checkAccount, deleteNotification, receiveNotification, sendMessage } from './lib/api';
import { formatRecipient, notificationToChat } from './lib/chat';
import { loadChats, saveChats } from './lib/storage';
import type { Chat, ChatMessage, Credentials } from './types';

const sortChats = (chats: Chat[]) => [...chats].sort((a, b) => b.updatedAt - a.updatedAt);

const delay = (duration: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timeout = window.setTimeout(resolve, duration);
    signal.addEventListener('abort', () => {
      window.clearTimeout(timeout);
      resolve();
    }, { once: true });
  });

function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [connection, setConnection] = useState<'connecting' | 'online' | 'offline'>('connecting');
  const [notice, setNotice] = useState('');
  const selectedChatRef = useRef<string | null>(null);

  useEffect(() => {
    selectedChatRef.current = selectedChatId;
  }, [selectedChatId]);

  useEffect(() => {
    if (credentials) saveChats(credentials.idInstance, chats);
  }, [chats, credentials]);

  useEffect(() => {
    if (!credentials) return;

    const controller = new AbortController();
    let active = true;
    let reportedError = false;

    const poll = async () => {
      setConnection('connecting');

      while (active && !controller.signal.aborted) {
        try {
          const notification = await receiveNotification(credentials, controller.signal);
          if (!active) break;

          setConnection('online');
          reportedError = false;

          if (notification) {
            const incomingChat = notificationToChat(notification);

            if (incomingChat) {
              setChats((current) => {
                const existing = current.find((chat) => chat.id === incomingChat.id);
                if (!existing) {
                  return sortChats([
                    {
                      ...incomingChat,
                      unread: selectedChatRef.current === incomingChat.id ? 0 : 1,
                    },
                    ...current,
                  ]);
                }

                const incomingMessage = incomingChat.messages[0];
                if (existing.messages.some((message) => message.id === incomingMessage.id)) return current;

                return sortChats(current.map((chat) =>
                  chat.id === incomingChat.id
                    ? {
                        ...chat,
                        title: chat.title || incomingChat.title,
                        messages: [...chat.messages, incomingMessage],
                        updatedAt: incomingMessage.timestamp,
                        unread: selectedChatRef.current === chat.id ? 0 : chat.unread + 1,
                      }
                    : chat,
                ));
              });
            }

            await deleteNotification(credentials, notification.receiptId, controller.signal);
          }
        } catch (error) {
          if (controller.signal.aborted) break;
          setConnection('offline');
          if (!reportedError) {
            const message = error instanceof Error ? error.message : 'Не удалось получить сообщения';
            setNotice(message);
            reportedError = true;
          }
          await delay(3000, controller.signal);
        }
      }
    };

    void poll();

    return () => {
      active = false;
      controller.abort();
    };
  }, [credentials]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 6000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const visibleChats = useMemo(() => {
    const value = query.trim().toLocaleLowerCase('ru');
    if (!value) return chats;
    return chats.filter((chat) =>
      chat.title.toLocaleLowerCase('ru').includes(value) ||
      chat.subtitle.toLocaleLowerCase('ru').includes(value),
    );
  }, [chats, query]);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId) ?? null;

  const connect = (nextCredentials: Credentials) => {
    const storedChats = sortChats(loadChats(nextCredentials.idInstance));
    setCredentials(nextCredentials);
    setChats(storedChats);
    setSelectedChatId(storedChats[0]?.id ?? null);
    setConnection('connecting');
  };

  const logout = () => {
    setCredentials(null);
    setChats([]);
    setSelectedChatId(null);
    setQuery('');
    setNotice('');
  };

  const selectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setChats((current) => current.map((chat) =>
      chat.id === chatId ? { ...chat, unread: 0 } : chat,
    ));
  };

  const createChat = async (recipient: string, title?: string) => {
    if (!credentials) return false;

    let chatId = recipient;
    let resolvedTitle = title;
    let subtitle = formatRecipient(recipient);

    if (recipient.endsWith('@c.us') || recipient.startsWith('@')) {
      try {
        const account = await checkAccount(
          credentials,
          recipient.startsWith('@')
            ? { username: recipient }
            : { phoneNumber: Number(recipient.replace(/@c\.us$/i, '')) },
        );

        if (!account.exist || !account.chatId) {
          setNotice(account.reason || 'Получатель не найден. Проверьте номер или настройки приватности Telegram.');
          return false;
        }

        chatId = account.chatId;
        subtitle = account.phoneNumber
          ? formatRecipient(`${account.phoneNumber}@c.us`)
          : account.username || recipient;
        resolvedTitle = resolvedTitle || account.username || subtitle;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Не удалось проверить получателя';
        setNotice(message);
        return false;
      }
    }

    const existing = chats.find((chat) => chat.id === chatId);
    if (!existing) {
      const now = Date.now();
      setChats((current) => sortChats([
        {
          id: chatId,
          title: resolvedTitle || formatRecipient(chatId),
          subtitle,
          messages: [],
          unread: 0,
          updatedAt: now,
        },
        ...current,
      ]));
    }
    setSelectedChatId(chatId);
    setNewChatOpen(false);
    return true;
  };

  const deleteSelectedChat = () => {
    if (!selectedChat) return;
    const confirmed = window.confirm(
      `Удалить чат «${selectedChat.title}» и его локальную историю? Это действие нельзя отменить.`,
    );
    if (!confirmed) return;

    setChats((current) => current.filter((chat) => chat.id !== selectedChat.id));
    setSelectedChatId(null);
  };

  const handleSend = async (text: string) => {
    if (!credentials || !selectedChatId) return;

    const optimisticId = crypto.randomUUID();
    const optimisticMessage: ChatMessage = {
      id: optimisticId,
      chatId: selectedChatId,
      text,
      direction: 'outgoing',
      timestamp: Date.now(),
      status: 'sending',
    };

    setChats((current) => sortChats(current.map((chat) =>
      chat.id === selectedChatId
        ? {
            ...chat,
            messages: [...chat.messages, optimisticMessage],
            updatedAt: optimisticMessage.timestamp,
          }
        : chat,
    )));

    try {
      const response = await sendMessage(credentials, selectedChatId, text);
      setChats((current) => current.map((chat) => ({
        ...chat,
        messages: chat.messages.map((message) =>
          message.id === optimisticId
            ? { ...message, id: response.idMessage || optimisticId, status: 'sent' }
            : message,
        ),
      })));
    } catch (error) {
      setChats((current) => current.map((chat) => ({
        ...chat,
        messages: chat.messages.map((message) =>
          message.id === optimisticId ? { ...message, status: 'failed' } : message,
        ),
      })));
      const message = error instanceof Error ? error.message : 'Сообщение не отправлено';
      setNotice(message);
    }
  };

  if (!credentials) return <LoginScreen onConnect={connect} />;

  return (
    <main className="app-shell">
      <div className="messenger">
        <Sidebar
          chats={visibleChats}
          selectedChatId={selectedChatId}
          idInstance={credentials.idInstance}
          query={query}
          connection={connection}
          onQueryChange={setQuery}
          onSelect={selectChat}
          onNewChat={() => setNewChatOpen(true)}
          onLogout={logout}
        />
        <ChatView
          chat={selectedChat}
          onBack={() => setSelectedChatId(null)}
          onNewChat={() => setNewChatOpen(true)}
          onDelete={deleteSelectedChat}
          onSend={handleSend}
        />
      </div>

      <NewChatDialog
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onCreate={createChat}
      />

      {notice && (
        <div className="toast" role="status">
          <AlertCircle size={19} />
          <span>{notice}</span>
          <button onClick={() => setNotice('')} aria-label="Закрыть уведомление"><X size={17} /></button>
        </div>
      )}
    </main>
  );
}

export default App;
