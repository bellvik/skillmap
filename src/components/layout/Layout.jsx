import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useState } from 'react';
import { getApiError } from '../../api/client';

const Layout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const [logoutError, setLogoutError] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      setLogoutError('');
    } catch (error) {
      setLogoutError(getApiError(error.cause, error.message));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              SkillMap
            </Link>
            <nav className="flex items-center gap-2 text-xs sm:gap-4 sm:text-sm md:gap-8">
              <Link to="/" className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors">
                Главная
              </Link>
              <Link to="/professions" className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors">
                Профессии
              </Link>
              {currentUser && (
                <Link to="/my-maps" className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors">
                  Мои карты
                </Link>
              )}
            </nav>
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  {/* Отображение имени пользователя */}
                  <span className="text-gray-700 dark:text-gray-300 hidden md:block">
                    {currentUser.name}
                  </span>
                  {/* Кнопка выхода */}
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  {/* Иконка пользователя */}
                  <Link to="/login" className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </Link>
                </>
              )}
              
              {/* Иконка LinkedIn */}
              <a href="#" className="hidden text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors sm:inline-flex">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              
              {/* Иконка Twitter / X */}
              <a href="#" className="hidden text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors sm:inline-flex">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
            </div>
          </div>
          {logoutError && (
            <p role="alert" className="mt-3 text-right text-sm text-red-600">
              {logoutError}
            </p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="grow container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} SkillMap. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;