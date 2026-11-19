import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProfessionById, getSkillsByProfession } from '../data/mockData';
import SkillDetailModal from '../components/SkillDetailModal';
import { useAuth } from '../context/AuthContext';
import { useSkillStatuses } from '../hooks/useSkillStatuses';

const SkillMapPage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { getSkillStatus, updateSkillStatus } = useSkillStatuses();
  // Состояния
  const [profession, setProfession] = useState(null);
  const [skills, setSkills] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  

  
  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Читаем настройки пользователя из localStorage
        const saved = localStorage.getItem(`skillmap_profession_${id}`);
        if (saved) {
          setMapData(JSON.parse(saved));
        }

        // 2. Загружаем данные профессии и навыков
        const prof = getProfessionById(id);
        if (!prof) {
          setError('Профессия не найдена или была архивирована.');
          setLoading(false);
          return;
        }
        
        setProfession(prof);
        const profSkills = getSkillsByProfession(id);
        setSkills(profSkills);
        setLoading(false);
      } catch (err) {
        console.error('Ошибка загрузки данных карты:', err);
        setError('Не удалось загрузить карту навыков. Попробуйте обновить страницу.');
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Вспомогательная функция: получить имя категории по ID
  const getCategoryName = (categoryId) => {
    // Для упрощения берем названия из mockData (в реальном проекте можно импортировать getCategories)
    const categories = [
      { id: 1, name: 'Frontend' },
      { id: 2, name: 'Version Control' },
      { id: 3, name: 'Data Science' },
      { id: 4, name: 'DevOps' }
    ];
    const cat = categories.find(c => String(c.id) === String(categoryId));
    return cat ? cat.name : 'Общее';
  };

  // Группировка навыков по категориям
  const groupedSkills = skills.reduce((acc, skill) => {
    const catName = getCategoryName(skill.categoryId);
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(skill);
    return acc;
    // Сортировка внутри категории по полю order
  }, {});

  Object.keys(groupedSkills).forEach(key => {
    groupedSkills[key].sort((a, b) => a.order - b.order);
  });

  // --- UI: Состояние загрузки (RULE-03) ---
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- UI: Состояние ошибки / пустоты (RULE-03) ---
  if (error || !profession) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Карта недоступна'}</h2>
        <Link
          to="/professions"
          className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          ← Вернуться к списку профессий
        </Link>
      </div>
    );
  }

  // --- UI: Основная отрисовка карты (UC-4, FR-02) ---
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Заголовок и навигация */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <Link to="/professions" className="text-purple-600 hover:text-purple-700 text-sm mb-2 inline-block">
            ← К списку профессий
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{profession.name}</h1>
          {mapData && (
            <p className="text-gray-600 mt-1">
              Выбранный уровень: <span className="font-semibold capitalize">{mapData.level}</span>
            </p>
          )}
        </div>
        <Link
          to={`/professions/${id}/setup`}
          className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
        >
          ⚙️ Изменить настройки
        </Link>
      </div>

      {/* Легенда (NFR-06: статусы различимы не только по цвету, но и по тексту/иконке) */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 flex flex-wrap gap-6">
        <span className="font-semibold text-gray-700 mr-2">Легенда:</span>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-gray-300 border border-gray-400"></span>
          <span className="text-sm text-gray-700">Не начато</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-amber-400 border border-amber-500 flex items-center justify-center text-white text-[10px]">◐</span>
          <span className="text-sm text-gray-700">В процессе</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-green-500 border border-green-600 flex items-center justify-center text-white text-[10px]">✓</span>
          <span className="text-sm text-gray-700">Освоено</span>
        </div>
      </div>

      {/* Сетка карты по категориям */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.keys(groupedSkills).map(categoryName => (
          <div key={categoryName} className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b-2 border-purple-200 pb-2">
              {categoryName}
            </h3>
            
            {groupedSkills[categoryName].map(skill => {
              // Проверка статуса (используем String() для надежности, как мы выяснили ранее)
              const status = currentUser
                ? getSkillStatus(currentUser.id, id, skill.id)
                : (mapData?.selectedSkillIds?.some(sid => String(sid) === String(skill.id)) ? 'mastered' : 'not_started');
              const isMastered = status === 'mastered';
              const isInProgress = status === 'in_progress';
              
              // Получаем названия предпосылок для отображения связей текстом
              const prereqNames = skill.prerequisites
                .map(pid => skills.find(s => String(s.id) === String(pid))?.name)
                .filter(Boolean);
              let cardClass = 'bg-white border-gray-200 hover:border-purple-300'; // по умолчанию
              if (isMastered) cardClass = 'bg-green-50 border-green-300 shadow-sm';
              if (isInProgress) cardClass = 'bg-amber-50 border-amber-300 shadow-sm';

              return (
                <div key={skill.id} className={`p-4 rounded-lg border transition-all ${cardClass}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                    
                    {/* 3. Бейдж статуса (теперь их 3 варианта) */}
                    {isMastered ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                        <span>✓</span> Освоено
                      </span>
                    ) : isInProgress ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded">
                        <span>◐</span> В процессе
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Не начато
                      </span>
                    )}
                  </div>
                  
                  {skill.description && (
                    <p className="text-sm text-gray-600 mb-3">{skill.description}</p>
                  )}
                  
                  {prereqNames.length > 0 && (
                    <div className="text-xs text-gray-500 mb-2">
                      <span className="font-medium">Требует:</span> {prereqNames.join(', ')}
                    </div>
                  )}

                  {/* 4. Кнопка открытия модалки */}
                  <button
                    onClick={() => setSelectedSkill(skill)}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-800 font-medium w-full text-left"
                  >
                    Подробнее о навыке →
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
        {selectedSkill && (
          <SkillDetailModal
            skill={selectedSkill}
            allSkills={skills}
            status={currentUser
              ? getSkillStatus(currentUser.id, id, selectedSkill.id)
              : (mapData?.selectedSkillIds?.some(sid => String(sid) === String(selectedSkill.id)) ? 'mastered' : 'not_started')}
            userId={currentUser?.id || null}
            onUpdateStatus={(newStatus) => {
              if (currentUser) {
                updateSkillStatus(currentUser.id, id, selectedSkill.id, newStatus);
                setMapData(prev => ({ ...prev, _refresh: Date.now() }));
              }
            }}
            onClose={() => setSelectedSkill(null)}
          />
        )}
    </div>
  );
};

export default SkillMapPage;