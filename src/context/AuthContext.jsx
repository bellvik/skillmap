import React, { createContext, useContext, useState, useEffect } from 'react';

// Создаем контекст
const AuthContext = createContext();

// Провайдер контекста
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Инициализация из localStorage при загрузке приложения
  useEffect(() => {
    const savedUser = localStorage.getItem('skillmap_current_user');
    const users = localStorage.getItem('skillmap_users');

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  // Регистрация нового пользователя
  const register = (email, password, name) => {
    // Проверяем, существует ли пользователь с таким email
    const existingUsers = localStorage.getItem('skillmap_users');
    let users = existingUsers ? JSON.parse(existingUsers) : [];

    if (users.find(user => user.email === email)) {
      throw new Error('Пользователь с таким email уже существует');
    }

    // Создаем нового пользователя
    const newUser = {
      id: Date.now().toString(), // Простой способ генерации уникального ID
      email,
      password, // TODO: заменить на API и хеширование
      name
    };

    // Добавляем пользователя в список
    users.push(newUser);
    localStorage.setItem('skillmap_users', JSON.stringify(users));

    // Авторизуем его сразу
    localStorage.setItem('skillmap_current_user', JSON.stringify(newUser));
    setCurrentUser(newUser);

    return newUser;
  };

  // Вход пользователя
  const login = (email, password) => {
    const users = localStorage.getItem('skillmap_users');
    
    if (!users) {
      throw new Error('Пользователи не найдены');
    }

    const parsedUsers = JSON.parse(users);
    const user = parsedUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Неверный email или пароль');
    }

    // Сохраняем пользователя в localStorage
    localStorage.setItem('skillmap_current_user', JSON.stringify(user));
    setCurrentUser(user);

    return user;
  };

  // Выход пользователя
  const logout = () => {
    localStorage.removeItem('skillmap_current_user');
    setCurrentUser(null);
  };

  // Значение, которое будет предоставляться контекстом
  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};