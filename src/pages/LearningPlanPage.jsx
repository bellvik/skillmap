import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProfessionById, getSkillsByProfession, getResourcesByIds } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useSkillStatuses } from '../hooks/useSkillStatuses';

const LearningPlanPage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { getUserMaps, getSkillStatus } = useSkillStatuses();
  
  const [profession, setProfession] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const [learningSteps, setLearningSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      try {
        // Загружаем данные профессии
        const prof = getProfessionById(id);
        if (!prof) {
          setError('Профессия не найдена или была архивирована.');
          setLoading(false);
          return;
        }
        setProfession(prof);

        // Загружаем все навыки профессии
        const skills = getSkillsByProfession(id);
        setAllSkills(skills);

        // Определяем пробелы (навыки, которые не имеют статуса 'mastered')
        let gaps = [];
        
        if (currentUser) {
          // Для авторизованного пользователя используем статусы из хранилища
          const userMaps = getUserMaps(currentUser.id);
          const userMap = userMaps.find(map => String(map.professionId) === String(id));
          
          gaps = skills.filter(skill => {
            const status = userMap ? 
              userMap.skills.find(s => String(s.skillId) === String(skill.id))?.status 
              : 'not_started';
            return status !== 'mastered';
          });
        } else {
          // Для гостей считаем все навыки пробелами
          gaps = skills;
        }

        // Сортировка пробелов: навыки без предпосылок или с уже освоенными предпосылками идут первыми
        const sortedGaps = gaps.sort((a, b) => {
          // Проверяем, есть ли у навыков предпосылки
          const hasPrereqsA = a.prerequisites && a.prerequisites.length > 0;
          const hasPrereqsB = b.prerequisites && b.prerequisites.length > 0;
          
          // Если у одного навыка нет предпосылок, а у другого есть - первый идет первым
          if (!hasPrereqsA && hasPrereqsB) return -1;
          if (hasPrereqsA && !hasPrereqsB) return 1;
          
          // Если оба без предпосылок или с предпосылками - сортируем по алфавиту
          return a.name.localeCompare(b.name);
        });

        setLearningSteps(sortedGaps);
        setLoading(false);
      } catch (err) {
        console.error('Ошибка загрузки данных плана обучения:', err);
        setError('Не удалось загрузить план обучения. Попробуйте обновить страницу.');
        setLoading(false);
      }
    };

    loadData();
  }, [id, currentUser]);

  // Функция для получения статуса навыка
  const getSkillStatusForStep = (skillId) => {
    if (!currentUser) return 'not_started';
    
    const userMaps = getUserMaps(currentUser.id);
    const userMap = userMaps.find(map => String(map.professionId) === String(id));
    
    if (!userMap) return 'not_started';
    
    const skillStatus = userMap.skills.find(s => String(s.skillId) === String(skillId))?.status;
    return skillStatus || 'not_started';
  };

  // Функция для получения ресурса навыка
  const getResourceUrl = (resourceIds) => {
    if (!resourceIds || resourceIds.length === 0) return null;
    
    const resources = getResourcesByIds(resourceIds);
    return resources.length > 0 ? resources[0].url : null;
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

  // --- UI: Состояние загрузки (RULE-03) ---
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- UI: Состояние ошибки / пустоты (RULE-03) ---
  if (error || !profession) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Профессия не найдена'}</h2>
        <p className="text-gray-600 mb-6">Возможно, она была архивирована или удалена.</p>
        <Link 
          to="/professions" 
          className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Вернуться к списку профессий
        </Link>
      </div>
    );
  }

  // Если нет пробелов - отображаем сообщение об успехе
  if (learningSteps.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Поздравляем!</h1>
          <p className="text-xl text-gray-700 mb-6">Вы освоили все навыки этой профессии.</p>
          <div className="flex justify-center gap-4">
            <Link 
              to={`/professions/${id}/map`} 
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Вернуться к карте
            </Link>
            <Link 
              to="/professions" 
              className="px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
            >
              Выбрать другую профессию
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">План обучения</h1>
        <Link 
          to={`/professions/${id}/map`} 
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
        >
          ← Назад к карте
        </Link>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{profession.name}</h2>
        <p className="text-gray-600">{profession.description}</p>
      </div>

      <div className="space-y-4">
        {learningSteps.map((step, index) => {
          const status = getSkillStatusForStep(step.id);
          const resourceUrl = getResourceUrl(step.resourceIds);
          
          return (
            <div key={step.id} className="flex items-start gap-4 p-4 bg-white rounded-lg shadow border border-gray-100">
              <div className="shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{step.name}</h3>
                
                {step.description && (
                  <p className="text-gray-600 mb-3">{step.description}</p>
                )}
                
                <div className="flex items-center gap-3 mb-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${getStatusColor(status)}`}>
                    {getStatusText(status)}
                  </span>
                </div>
                
                {resourceUrl ? (
                  <a 
                    href={resourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 hover:underline"
                  >
                    Открыть ресурс →
                  </a>
                ) : (
                  <span className="text-sm text-gray-500">Ресурсы не найдены</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPlanPage;