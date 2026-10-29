import { FormEvent, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Server } from 'lucide-react';
import type { Credentials } from '../types';

type LoginScreenProps = {
  onConnect: (credentials: Credentials) => void;
};

export function LoginScreen({ onConnect }: LoginScreenProps) {
  const [apiUrl, setApiUrl] = useState('https://api.green-api.com');
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [showApiUrl, setShowApiUrl] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!/^https?:\/\//i.test(apiUrl.trim())) {
      setError('Укажите корректный адрес API');
      return;
    }
    if (!/^\d+$/.test(idInstance.trim())) {
      setError('ID инстанса должен состоять из цифр');
      return;
    }
    if (!apiTokenInstance.trim()) {
      setError('Введите токен инстанса');
      return;
    }

    onConnect({
      apiUrl: apiUrl.trim(),
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    });
  };

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-card__heading">
          <p className="eyebrow">GREEN-API / ЧАТ</p>
          <h1 id="login-title">Подключение<br />к инстансу</h1>
          <p>Введите данные доступа из личного кабинета</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <label className="field">
            <span>ID инстанса</span>
            <span className="field__control">
              <Server size={18} />
              <input
                value={idInstance}
                onChange={(event) => setIdInstance(event.target.value)}
                inputMode="numeric"
                autoComplete="username"
                placeholder="Например, 3100000000"
                autoFocus
              />
            </span>
          </label>

          <label className="field">
            <span>Токен инстанса</span>
            <span className="field__control">
              <LockKeyhole size={18} />
              <input
                value={apiTokenInstance}
                onChange={(event) => setApiTokenInstance(event.target.value)}
                type={showToken ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Введите apiTokenInstance"
              />
              <button
                type="button"
                className="icon-button icon-button--inside"
                onClick={() => setShowToken((value) => !value)}
                aria-label={showToken ? 'Скрыть токен' : 'Показать токен'}
              >
                {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          <button
            type="button"
            className="login-form__advanced"
            onClick={() => setShowApiUrl((value) => !value)}
          >
            {showApiUrl ? 'Скрыть адрес API' : 'Изменить адрес API'}
          </button>

          {showApiUrl && (
            <label className="field field--compact">
              <span>Адрес API</span>
              <span className="field__control">
                <input
                  value={apiUrl}
                  onChange={(event) => setApiUrl(event.target.value)}
                  type="url"
                  placeholder="https://api.green-api.com"
                />
              </span>
            </label>
          )}

          {error && <p className="form-error" role="alert">{error}</p>}

          <button className="primary-button" type="submit">
            Подключиться
          </button>
        </form>

        <p className="login-card__privacy">
          <LockKeyhole size={14} />
          Данные остаются только в этой вкладке браузера
        </p>
      </section>
    </main>
  );
}
