import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowRight, LogIn, LogOut, Map } from 'lucide-react';
import { getApiError } from '../../api/client';
import { useAuth } from '../../context/useAuth';

const Layout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const [logoutError, setLogoutError] = useState('');

  const navLinkClassName = ({ isActive }, display = 'inline-flex') => (
    `${display} h-full items-center border-b-2 px-1.5 text-sm font-medium transition-colors sm:px-3 ${
      isActive
        ? 'border-purple-700 text-purple-800'
        : 'border-transparent text-slate-700 hover:border-purple-400 hover:text-purple-800'
    }`
  );

  const handleLogout = async () => {
    try {
      await logout();
      setLogoutError('');
    } catch (error) {
      setLogoutError(getApiError(error.cause, error.message));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-[#dfbd76] bg-[#f4d58c]">
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-1 px-4 sm:gap-3 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex shrink-0 items-center gap-2 font-serif text-base font-semibold tracking-tight text-slate-950 sm:gap-2.5 sm:text-xl">
            <span className="flex size-9 items-center justify-center rounded-md bg-purple-700 text-white">
              <Map aria-hidden="true" size={19} />
            </span>
            <span>SkillMap</span>
          </Link>

          <nav aria-label="Основная навигация" className="flex h-full items-center gap-1">
            <NavLink end to="/" className={(link) => navLinkClassName(link, 'hidden sm:inline-flex')}>
              <span className="hidden sm:inline">Главная</span>
              <span className="sm:hidden">Домой</span>
            </NavLink>
            <NavLink to="/professions" className={navLinkClassName}>
              Профессии
            </NavLink>
            {currentUser && (
              <NavLink to="/my-maps" className={navLinkClassName}>
                <span className="hidden sm:inline">Мои карты</span>
                <span className="sm:hidden">Карты</span>
              </NavLink>
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {currentUser ? (
              <>
                <span className="hidden max-w-36 truncate text-sm text-slate-600 xl:block">
                  {currentUser.name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Выйти из аккаунта"
                  className="inline-flex items-center gap-2 rounded-md border border-slate-800/40 bg-white/50 px-2 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-900 hover:bg-white sm:px-3"
                >
                  <LogOut aria-hidden="true" size={16} />
                  <span className="hidden sm:inline">Выйти</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-md border border-slate-800/50 bg-white/60 px-2 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 sm:px-3"
              >
                <LogIn aria-hidden="true" size={16} />
                <span>Войти</span>
                <ArrowRight aria-hidden="true" className="hidden sm:block" size={15} />
              </Link>
            )}
          </div>
        </div>
        {logoutError && (
          <p role="alert" className="mx-auto max-w-7xl px-4 pb-3 text-right text-sm text-red-700 sm:px-6 lg:px-8">
            {logoutError}
          </p>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 text-sm text-slate-500 sm:px-6 lg:px-8">
          <span className="font-medium text-slate-700">SkillMap</span>
          <span>© {new Date().getFullYear()} SkillMap. Urfu University Project.</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
