import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' или 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Только для регистрации
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Получаем местоположение для редиректа после успешного входа
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        await login(email, password);
        navigate(from, { replace: true });
      } else {
        await register(email, password, name);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-4 sm:py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-7 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">SkillMap</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {activeTab === 'login' ? 'С возвращением' : 'Создайте аккаунт'}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {activeTab === 'login'
                ? 'Войдите, чтобы продолжить работу со своими картами.'
                : 'Сохраняйте карты навыков и отмечайте свой прогресс.'}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                activeTab === 'login'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
              onClick={() => setActiveTab('login')}
            >
              Вход
            </button>
            <button
              type="button"
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                activeTab === 'register'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
              onClick={() => setActiveTab('register')}
            >
              Регистрация
            </button>
          </div>

          {error && (
            <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                required
              />
            </div>

            {activeTab === 'register' && (
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                  Имя
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-950 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-950 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Обработка...' : activeTab === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-violet-700">
              На главную
            </Link>
          </div>
      </div>
    </div>
  );
};

export default LoginPage;