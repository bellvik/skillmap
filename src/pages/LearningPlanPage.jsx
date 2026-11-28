import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api, getApiError } from '../api/client';
import { useAuth } from '../context/useAuth';
import { useSkillStatuses } from '../hooks/useSkillStatuses';

const LearningPlanPage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { getUserMaps, updateSkillStatus } = useSkillStatuses();
  
  const [profession, setProfession] = useState(null);
  const [learningSteps, setLearningSteps] = useState([]);
  const [stepStatuses, setStepStatuses] = useState({}); // Локальный стейт для мгновенного обновления UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState('');

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      try {
        const [professionResponse, skillsResponse, userMaps] = await Promise.all([
          api.get(`/professions/${id}`),
          api.get(`/professions/${id}/skills`),
          currentUser ? getUserMaps() : Promise.resolve([]),
        ]);
        const prof = professionResponse.data;
        setProfession(prof);

        const skills = skillsResponse.data;
        const userMap = userMaps.find(map => String(map.professionId) === String(id));
        const statuses = Object.fromEntries(
          (userMap?.skills || []).map(skill => [String(skill.skillId), skill.status])
        );
        
        // Определяем пробелы
        let gaps = [];
        const initialStatuses = {};
        
        skills.forEach(skill => {
          const status = currentUser ? statuses[String(skill.id)] || 'not_started' : 'not_started';
            
          if (status !== 'mastered') {
            gaps.push(skill);
            initialStatuses[skill.id] = status;
          }
        });

        // Сортировка: навыки без предпосылок идут первыми
        const sortedGaps = gaps.sort((a, b) => {
          const hasPrereqsA = a.prerequisites && a.prerequisites.length > 0;
          const hasPrereqsB = b.prerequisites && b.prerequisites.length > 0;
          if (!hasPrereqsA && hasPrereqsB) return -1;
          if (hasPrereqsA && !hasPrereqsB) return 1;
          return a.name.localeCompare(b.name);
        });

        setLearningSteps(sortedGaps);
        setStepStatuses(initialStatuses);
        setLoading(false);
      } catch (err) {
        console.error('Ошибка загрузки данных плана обучения:', err);
        setError(getApiError(err, 'Не удалось загрузить план обучения. Попробуйте обновить страницу.'));
        setLoading(false);
      }
    };

    loadData();
  }, [id, currentUser, getUserMaps]);

  const handleUpdateSkillStatus = async (skillId, newStatus) => {
    if (!currentUser) return;
    try {
      await updateSkillStatus(id, skillId, newStatus);
      setStepStatuses(prev => ({ ...prev, [skillId]: newStatus }));
      setSaveError('');
    } catch (err) {
      setSaveError(getApiError(err, 'Не удалось сохранить статус навыка.'));
    }
  };

  const getResource = (skill) => skill.resources?.[0] || null;

  // Расчёт прогресса на основе локального стейта (быстро, без чтения localStorage)
  const masteredCount = Object.values(stepStatuses).filter(s => s === 'mastered').length;
  const totalCount = learningSteps.length;
  const progress = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  const getStatusConfig = (status) => {
    switch(status) {
      case 'not_started':
        return { text: 'Не начато', icon: '○', badge: 'bg-gray-100 text-gray-700', btn: 'bg-gray-600 text-white' };
      case 'in_progress':
        return { text: 'В процессе', icon: '◐', badge: 'bg-yellow-100 text-yellow-700', btn: 'bg-yellow-600 text-white' };
      case 'mastered':
        return { text: 'Освоено', icon: '✓', badge: 'bg-green-100 text-green-700', btn: 'bg-green-600 text-white' };
      default:
        return { text: 'Не начато', icon: '○', badge: 'bg-gray-100 text-gray-700', btn: 'bg-gray-600 text-white' };
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
             </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !profession) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Профессия не найдена'}</h2>
        <Link to="/professions" className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Вернуться к списку профессий
        </Link>
      </div>
    );
  }

  // Пустое состояние: все навыки освоены
  if (learningSteps.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Поздравляем!</h1>
          <p className="text-xl text-gray-700 mb-6">Вы освоили все навыки профессии «{profession.name}».</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to={`/professions/${id}/map`} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Вернуться к карте
            </Link>
            <Link to="/professions" className="px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
              Выбрать другую профессию
            </Link>
          </div>
          {currentUser && (
            <div className="mt-6">
              <Link to="/my-maps" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 font-medium border-t border-gray-300 pt-4 mt-4">
                ← В Мои карты
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Навигация (ШАГ 6) */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Link to={`/professions/${id}/map`} className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium">
          ← Назад к карте
        </Link>
        {currentUser && (
          <Link to="/my-maps" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 font-medium border-l border-gray-300 pl-3">
            ← В Мои карты
          </Link>
        )}
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">План обучения: {profession.name}</h1>
      <p className="text-gray-600 mb-6">{profession.description}</p>
      {saveError && (
        <div role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      {/* Прогресс-бар (ШАГ 1) */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-700">Прогресс плана:</span>
          <span className="text-sm text-gray-600 font-semibold">
            {masteredCount}/{totalCount} шагов ({progress}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Шаги плана (ШАГИ 2, 3, 4) */}
      <div className="space-y-4">
        {learningSteps.map((step, index) => {
          const status = stepStatuses[step.id] || 'not_started';
          const config = getStatusConfig(status);
          const resource = getResource(step);
          
          return (
            <div key={step.id} className="flex items-start gap-4 p-5 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-purple-200 transition-colors">
              <div className="shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.name}</h3>
                
                {step.description && (
                  <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                )}
                
                {/* Бейдж статуса (ШАГ 3) */}
                <div className="mb-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${config.badge}`}>
                    <span>{config.icon}</span> {config.text}
                  </span>
                </div>
                
                {currentUser ? (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {['not_started', 'in_progress', 'mastered'].map((s) => {
                      const sConfig = getStatusConfig(s);
                      const isActive = status === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleUpdateSkillStatus(step.id, s)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                            isActive
                              ? `${sConfig.btn} border-transparent`
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {sConfig.icon} {sConfig.text}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mb-4 text-sm text-slate-600">
                    <Link
                      to="/login"
                      state={{ from: { pathname: `/professions/${id}/plan` } }}
                      className="font-semibold text-violet-700 hover:text-violet-800 hover:underline"
                    >
                      Войдите
                    </Link>
                    , чтобы отмечать прогресс и сохранять статусы навыков.
                  </p>
                )}
                
                {/* Ресурсы и ссылка на карту (ШАГ 4) */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 border-t border-gray-100">
                  <Link 
                    to={`/professions/${id}/map`} 
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium hover:underline"
                  >
                    Открыть на карте →
                  </Link>
                  
                  {resource ? (
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    >
                      📖 Открыть ресурс
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Ресурсы пока не добавлены</span>
                  )}
                  
                  {resource && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {resource.type} • {resource.language}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPlanPage;