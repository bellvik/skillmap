import { useState, useEffect } from 'react';
import { api, getApiError } from '../api/client';
import { AuthContext } from './authContext';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState('');

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => setCurrentUser(data.user))
      .catch((error) => {
        console.error('Не удалось проверить сессию пользователя:', error);
        setConnectionError(getApiError(error, 'Не удалось подключиться к серверу. Проверьте, запущен ли backend.'));
      })
      .finally(() => setLoading(false));
  }, []);

  const register = async (email, password, name) => {
    try {
      const { data } = await api.post('/auth/register', { email, password, name });
      setCurrentUser(data.user);
      setConnectionError('');
      return data.user;
    } catch (error) {
      throw new Error(getApiError(error, 'Не удалось зарегистрироваться. Попробуйте ещё раз.'), { cause: error });
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setCurrentUser(data.user);
      setConnectionError('');
      return data.user;
    } catch (error) {
      throw new Error(getApiError(error, 'Не удалось войти. Попробуйте ещё раз.'), { cause: error });
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setCurrentUser(null);
    } catch (error) {
      throw new Error(getApiError(error, 'Не удалось выйти из аккаунта. Попробуйте ещё раз.'), { cause: error });
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && (
        <>
          {connectionError && (
            <div role="alert" className="fixed bottom-4 right-4 z-50 max-w-md rounded-lg bg-red-100 p-4 text-sm text-red-800 shadow-lg">
              {connectionError}
            </div>
          )}
          {children}
        </>
      )}
    </AuthContext.Provider>
  );
};