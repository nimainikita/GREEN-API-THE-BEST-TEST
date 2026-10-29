import { FormEvent, useEffect, useRef, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { normalizeRecipient } from '../lib/chat';

type NewChatDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (recipient: string, title?: string) => Promise<boolean>;
};

export function NewChatDialog({ open, onClose, onCreate }: NewChatDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [recipient, setRecipient] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedRecipient = normalizeRecipient(recipient);
    if (!normalizedRecipient) {
      setError('Введите номер телефона, @username или числовой chatId');
      return;
    }

    setSubmitting(true);
    const created = await onCreate(normalizedRecipient, name.trim() || undefined);
    setSubmitting(false);
    if (!created) return;

    setRecipient('');
    setName('');
    setError('');
  };

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      onCancel={onClose}
      onClose={onClose}
      aria-labelledby="new-chat-title"
    >
      <form onSubmit={handleSubmit} className="dialog__content">
        <header className="dialog__header">
          <span className="dialog__icon"><MessageCircle size={22} /></span>
          <div>
            <h2 id="new-chat-title">Новый чат</h2>
            <p>Начните диалог по номеру или chatId</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Закрыть">
            <X size={20} />
          </button>
        </header>

        <label className="field">
          <span>Получатель</span>
          <span className="field__control field__control--plain">
            <input
              value={recipient}
              onChange={(event) => {
                setRecipient(event.target.value);
                setError('');
              }}
            placeholder="+7 999 123-45-67, @username или chatId"
              autoFocus
            />
          </span>
          <small>Для номера или @username приложение сначала получит корректный chatId</small>
        </label>

        <label className="field">
          <span>Имя <em>необязательно</em></span>
          <span className="field__control field__control--plain">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Как назвать чат"
            />
          </span>
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? 'Проверяем получателя…' : 'Создать чат'}
        </button>
      </form>
    </dialog>
  );
}
