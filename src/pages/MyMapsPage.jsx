import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { useSkillStatuses } from '../hooks/useSkillStatuses';
import { Link, useNavigate } from 'react-router-dom';
import { getApiError } from '../api/client';

const MyMapsPage = () => {
  const { currentUser } = useAuth();
  const { getUserMaps, deleteUserMap } = useSkillStatuses();
  const navigate = useNavigate();
  const [userMaps, setUserMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Проверяем авторизацию
  useEffect(() => {
    if (!currentUser?.id) {
      navigate('/login');
      return;
    }

    const loadUserMaps = async () => {
      try {
        const maps = await getUserMaps();
        // ВАЖНО: [...maps] создаёт копию, чтобы не мутировать исходный массив из localStorage
        const sortedMaps = [...maps].sort((a, b) => {
          const dateB = new Date(b.updatedAt || 0).getTime();
          const dateA = new Date(a.updatedAt || 0).getTime();
          return dateB - dateA;
        });
        setUserMaps(sortedMaps);
      } catch (err) {
        console.error('Ошибка загрузки карт пользователя:', err);
        setError(getApiError(err, 'Не удалось загрузить ваши карты.'));
      } finally {
        setLoading(false);
      }
    };

    loadUserMaps();
  // ЗАВИСИМОСТИ: только примитив id и navigate. getUserMaps теперь стабильна благодаря useCallback
  }, [currentUser?.id, getUserMaps, navigate]);

  // Функция для подсчета статусов навыков
  const countSkillStatuses = (skills) => {
    const counts = {
      not_started: 0,
      in_progress: 0,
      mastered: 0
    };

    if (skills) {
      skills.forEach(skill => {
        if (Object.prototype.hasOwnProperty.call(counts, skill.status)) {
          counts[skill.status]++;
        }
      });
    }

    return counts;
  };

  // Функция для расчета процента освоения
  const calculateProgress = (skills) => {
    if (!skills || skills.length === 0) return 0;
    
    const masteredCount = skills.filter(skill => skill.status === 'mastered').length;
    return Math.round((masteredCount / skills.length) * 100);
  };

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Функция для получения иконки по статусу
  const getStatusIcon = (status) => {
    switch(status) {
      case 'not_started':
        return '○';
      case 'in_progress':
        return '◐';
      case 'mastered':
        return '✓';
      default:
        return '○';
    }
  };

  // Функция для получения текста статуса
  const getStatusText = (status) => {
    switch(status) {
      case 'not_started':
        return 'Не начато';
      case 'in_progress':
        return 'В процессе';
      case 'mastered':
        return 'Освоено';
      default:
        return 'Не начато';
    }
  };

  // Функция для получения цвета статуса
  const getStatusColor = (status) => {
    switch(status) {
      case 'not_started':
        return 'bg-gray-200 text-gray-800';
      case 'in_progress':
        return 'bg-yellow-200 text-yellow-800';
      case 'mastered':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  // Если пользователь не авторизован - редирект на вход
  if (!currentUser) {
    return null;
  }

  // Показываем загрузку
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg p-6 shadow">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  const handleDeleteMap = async (professionId, professionName) => {
    if (window.confirm(`Вы уверены, что хотите удалить карту "${professionName}"? Все отметки будут потеряны.`)) {
      try {
        await deleteUserMap(professionId);
        setUserMaps(prev => prev.filter(map => String(map.professionId) !== String(professionId)));
      } catch (err) {
        setError(getApiError(err, 'Не удалось удалить карту.'));
      }
    }
  };
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Мои карты</h1>
        <Link 
          to="/professions" 
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
        >
          ← Назад к профессиям
        </Link>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {userMaps.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">У вас пока нет сохранённых карт</h2>
          <p className="text-gray-600 mb-6">Создайте первую карту навыков, выбрав профессию</p>
          <Link 
            to="/professions" 
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Выбрать профессию
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {userMaps.map((map) => {
            const counts = countSkillStatuses(map.skills);
            const progress = calculateProgress(map.skills);
            
            return (
              <div key={map.professionId} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                    <Link to={`/professions/${map.professionId}/map`} className="hover:text-purple-600 transition-colors">
                        {map.professionName || `Профессия ${map.professionId}`}
                    </Link>
                    </h2>
                    <p className="text-gray-600">Уровень: {map.level || 'Не указан'}</p>
                  </div>
                </div>

                {/* Прогресс */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Прогресс: {progress}%</span>
                    <span>{counts.mastered}/{map.skills?.length || 0} освоено</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Счетчики статусов */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { status: 'not_started', count: counts.not_started },
                    { status: 'in_progress', count: counts.in_progress },
                    { status: 'mastered', count: counts.mastered },
                  ].map(({ status, count }) => (
                    <div key={status} className="flex flex-col items-center text-center">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${getStatusColor(status)}`}>
                        <span className="text-sm">{getStatusIcon(status)}</span>
                      </span>
                      <span className="mt-1 text-sm font-medium leading-none tabular-nums text-gray-900">
                        {count}
                      </span>
                      <span className="mt-1 text-xs text-gray-500">{getStatusText(status)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>Последнее обновление: {formatDate(map.updatedAt)}</span>
                </div>

                <div className="flex gap-3">
                  <Link
                    to={`/professions/${map.professionId}/map`}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                    Открыть карту
                    </Link>
                  <button 
                    onClick={() => handleDeleteMap(map.professionId, map.professionName)}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                    >
                    Удалить
                </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyMapsPage;