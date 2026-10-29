import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, CheckCheck, MessageCirclePlus, SendHorizontal, Trash2 } from 'lucide-react';
import type { Chat } from '../types';
import { Avatar } from './Avatar';

type ChatViewProps = {
  chat: Chat | null;
  onBack: () => void;
  onNewChat: () => void;
  onDelete: () => void;
  onSend: (text: string) => Promise<void>;
};

const messageTime = (timestamp: number) =>
  new Intl.DateTimeFormat('ru', { hour: '2-digit', minute: '2-digit' }).format(timestamp);

const dayLabel = (timestamp: number) => {
  const date = new Date(timestamp);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Сегодня';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Вчера';
  return new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long' }).format(date);
};

export function ChatView({ chat, onBack, onNewChat, onDelete, onSend }: ChatViewProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages.length]);

  useEffect(() => {
    setMessage('');
    inputRef.current?.focus();
  }, [chat?.id]);

  if (!chat) {
    return (
      <section className="empty-chat">
        <div className="empty-chat__icon" aria-hidden="true">
          <MessageCirclePlus size={32} />
        </div>
        <h2>Нет выбранного чата</h2>
        <p>Выберите диалог в списке или создайте новый</p>
        <button className="secondary-button" onClick={onNewChat}>
          <MessageCirclePlus size={19} />
          Новый чат
        </button>
      </section>
    );
  }

  const submit = async () => {
    const text = message.trim();
    if (!text || sending) return;
    setMessage('');
    setSending(true);
    try {
      await onSend(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  };

  let previousDay = '';

  return (
    <section className="chat-view">
      <header className="chat-header">
        <button className="icon-button chat-header__back" onClick={onBack} aria-label="К списку чатов">
          <ArrowLeft size={21} />
        </button>
        <Avatar name={chat.title} online />
        <div className="chat-header__details">
          <strong>{chat.title}</strong>
          <span>{chat.subtitle}</span>
        </div>
        <button
          className="icon-button chat-header__delete"
          onClick={onDelete}
          aria-label="Удалить чат"
          title="Удалить чат"
        >
          <Trash2 size={19} />
        </button>
      </header>

      <div className="messages" aria-live="polite">
        <div className="messages__inner">
          {chat.messages.length === 0 && (
            <div className="conversation-start">
              <Avatar name={chat.title} size="lg" />
              <strong>{chat.title}</strong>
              <span>{chat.subtitle}</span>
              <p>Это начало вашей переписки</p>
            </div>
          )}

          {chat.messages.map((item) => {
            const currentDay = new Date(item.timestamp).toDateString();
            const showDay = currentDay !== previousDay;
            previousDay = currentDay;

            return (
              <div key={item.id}>
                {showDay && <div className="date-chip">{dayLabel(item.timestamp)}</div>}
                <div className={`message-row message-row--${item.direction}`}>
                  <div className={`message-bubble ${item.status === 'failed' ? 'message-bubble--failed' : ''}`}>
                    <span className="message-bubble__text">{item.text}</span>
                    <span className="message-bubble__meta">
                      <time>{messageTime(item.timestamp)}</time>
                      {item.direction === 'outgoing' && (
                        item.status === 'sending' ? <Check size={14} /> : <CheckCheck size={14} />
                      )}
                    </span>
                    {item.status === 'failed' && <small>Не отправлено</small>}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </div>

      <form className="composer" onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          value={message}
          onChange={(event) => setMessage(event.target.value.slice(0, 4000))}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Сообщение"
          aria-label="Сообщение"
        />
        <span className="composer__counter">{message.length > 3800 ? `${message.length}/4000` : ''}</span>
        <button
          className="send-button"
          type="submit"
          disabled={!message.trim() || sending}
          aria-label="Отправить сообщение"
        >
          <SendHorizontal size={20} />
        </button>
      </form>
    </section>
  );
}
