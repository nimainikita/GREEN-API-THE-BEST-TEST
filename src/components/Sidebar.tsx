import { LogOut, MessageCirclePlus, Search } from 'lucide-react';
import type { Chat } from '../types';
import { Avatar } from './Avatar';

type SidebarProps = {
  chats: Chat[];
  selectedChatId: string | null;
  idInstance: string;
  query: string;
  connection: 'connecting' | 'online' | 'offline';
  onQueryChange: (value: string) => void;
  onSelect: (chatId: string) => void;
  onNewChat: () => void;
  onLogout: () => void;
};

const timeLabel = (timestamp: number) =>
  new Intl.DateTimeFormat('ru', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp);

export function Sidebar({
  chats,
  selectedChatId,
  idInstance,
  query,
  connection,
  onQueryChange,
  onSelect,
  onNewChat,
  onLogout,
}: SidebarProps) {
  return (
    <aside className={`sidebar ${selectedChatId ? 'sidebar--chat-open' : ''}`}>
      <header className="sidebar__header">
        <div className="sidebar__brand">
          <div>
            <strong>Чаты</strong>
            <span className={`connection connection--${connection}`}>
              <i />
              {connection === 'online' ? 'на связи' : connection === 'connecting' ? 'подключение' : 'нет связи'}
            </span>
          </div>
        </div>
        <button className="icon-button" onClick={onLogout} aria-label="Выйти из инстанса" title="Выйти">
          <LogOut size={19} />
        </button>
      </header>

      <div className="sidebar__account">
        <span>Инстанс</span>
        <strong>{idInstance}</strong>
      </div>

      <div className="sidebar__actions">
        <label className="search-box">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Поиск"
            aria-label="Поиск по чатам"
          />
        </label>
        <button className="new-chat-button" onClick={onNewChat} aria-label="Новый чат" title="Новый чат">
          <MessageCirclePlus size={20} />
        </button>
      </div>

      <div className="sidebar__section-title">
        <span>Сообщения</span>
        <span>{chats.length}</span>
      </div>

      <nav className="chat-list" aria-label="Чаты">
        {chats.length === 0 ? (
          <div className="chat-list__empty">
            <MessageCirclePlus size={30} strokeWidth={1.5} />
            <p>Пока нет чатов</p>
            <button onClick={onNewChat}>Начать общение</button>
          </div>
        ) : (
          chats.map((chat) => {
            const last = chat.messages.at(-1);
            return (
              <button
                key={chat.id}
                className={`chat-item ${selectedChatId === chat.id ? 'chat-item--active' : ''}`}
                onClick={() => onSelect(chat.id)}
              >
                <Avatar name={chat.title} />
                <span className="chat-item__content">
                  <span className="chat-item__topline">
                    <strong>{chat.title}</strong>
                    <time>{timeLabel(chat.updatedAt)}</time>
                  </span>
                  <span className="chat-item__bottomline">
                    <span>{last?.direction === 'outgoing' && 'Вы: '}{last?.text || chat.subtitle}</span>
                    {chat.unread > 0 && <b>{chat.unread > 99 ? '99+' : chat.unread}</b>}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </nav>
    </aside>
  );
}
