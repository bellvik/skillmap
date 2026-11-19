import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProfessionById, getSkillsByProfession } from '../data/mockData';
import SkillDetailModal from '../components/SkillDetailModal';
import { useAuth } from '../context/AuthContext';
import { useSkillStatuses } from '../hooks/useSkillStatuses';

const SkillMapPage = () => {
  const { id } = useParams();
  
  // Состояния
  const [profession, setProfession] = useState(null);
  const [skills, setSkills] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [userSkillStatuses, setUserSkillStatuses] = useState({});
  
  // Получаем данные пользователя и хук статусов
  const { currentUser } = useAuth();
  const { getUserMaps, saveUserMap } = useSkillStatuses();

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Для авторизованного пользователя: читаем из нового хранилища
        if (currentUser) {
          const userMaps = getUserMaps(currentUser.id);
          const userMap = userMaps.find(map => String(map.professionId) === String(id));
          
          if (userMap) {
            setMapData(userMap);
            // Сохраняем статусы для всех навыков в объект для быстрого доступа
            const statuses = {};
            userMap.skills.forEach(skill => {
              statuses[String(skill.skillId)] = skill.status;
            });
            setUserSkillStatuses(statuses);
          } else {
            // Карта для этой профессии еще не создавалась пользователем
            setMapData({ professionId: id, skills: [] });
          }
        } else {
          // 2. Для гостей: читаем из старого хранилища (обратная совместимость)
          const saved = localStorage.getItem(`skillmap_profession_${id}`);
          if (saved) {
            setMapData(JSON.parse(saved));
          }
        }

        // 3. Загружаем метаданные профессии и навыков
        const prof = getProfessionById(id);
        if (!prof) {
          setError('Профессия не найдена или была архивирована.');
          setLoading(false);
          return;
        }
        
        setProfession(prof);
        setSkills(getSkillsByProfession(id));
        setLoading(false);
      } catch (err) {
        console.error('Ошибка загрузки данных карты:', err);
        setError('Не удалось загрузить карту навыков. Попробуйте обновить страницу.');
        setLoading(false);
      }
    };

    loadData();
  }, [id, currentUser]);

  // Вспомогательная функция: получить имя категории по ID
  const getCategoryName = (categoryId) => {
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Профессия не найдена'}</h2>
        <p className="text-gray-600 mb-6">Возможно, она была архивирована или удалена.</p>
        <Link to="/professions" className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Вернуться к списку профессий
        </Link>
      </div>
    );
  }

  // Функция для получения статуса навыка (оптимизированная)
  const getSkillStatusForSkill = (skillId) => {
    const strSkillId = String(skillId);
    if (currentUser) {
      return userSkillStatuses[strSkillId] || 'not_started';
    } else {
      return mapData?.selectedSkillIds?.some(sid => String(sid) === strSkillId) 
        ? 'mastered' 
        : 'not_started';
    }
  };

  // Обновление статуса навыка (UC-7, UC-8, FR-11)
  const handleUpdateSkillStatus = (skillId, newStatus) => {
    if (!currentUser) return;
    
    const strSkillId = String(skillId);
    const updatedMap = { 
      professionId: String(id), 
      professionName: profession.name,
      level: mapData?.level || '',
      skills: [...(mapData?.skills || [])],
      updatedAt: new Date().toISOString()
    };
    
    const existingIndex = updatedMap.skills.findIndex(s => String(s.skillId) === strSkillId);
    
    if (existingIndex >= 0) {
      updatedMap.skills[existingIndex].status = newStatus;
    } else {
      updatedMap.skills.push({ skillId: strSkillId, status: newStatus });
    }
    
    // Сохраняем в хранилище (FR-15: обновит существующую, не создаст дубликат)
    saveUserMap(currentUser.id, updatedMap);
    
    // Мгновенно обновляем локальный стейт для реактивного UI
    setUserSkillStatuses(prev => ({
      ...prev,
      [strSkillId]: newStatus
    }));
    setMapData(updatedMap);
    setSelectedSkill(null); // Закрываем модалку
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to="/professions" className="text-purple-600 hover:text-purple-700 text-sm mb-2 inline-block">
          ← К списку профессий
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{profession.name}</h1>
        <p className="text-gray-600 mb-4">{profession.description}</p>
        
        {/* Легенда статусов (NFR-06: различимы по цвету, тексту и иконке) */}
        <div className="flex flex-wrap items-center gap-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <span className="font-semibold text-gray-700 mr-2">Легенда:</span>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-700 text-[10px]">○</span>
            <span className="text-sm text-gray-700">Не начато</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-yellow-200 border border-yellow-300 flex items-center justify-center text-yellow-800 text-[10px]">◐</span>
            <span className="text-sm text-gray-700">В процессе</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-green-500 border border-green-600 flex items-center justify-center text-white text-[10px]">✓</span>
            <span className="text-sm text-gray-700">Освоено</span>
          </div>
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
              const skillStatus = getSkillStatusForSkill(skill.id);
              const prereqNames = skill.prerequisites
                .map(pid => skills.find(s => String(s.id) === String(pid))?.name)
                .filter(Boolean);

              let cardClass = 'bg-white border-gray-200 hover:border-purple-300';
              if (skillStatus === 'mastered') cardClass = 'bg-green-50 border-green-300 shadow-sm';
              if (skillStatus === 'in_progress') cardClass = 'bg-yellow-50 border-yellow-300 shadow-sm';

              return (
                <div key={skill.id} className={`p-4 rounded-lg border transition-all ${cardClass}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                    {skillStatus === 'mastered' ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                        <span>✓</span> Освоено
                      </span>
                    ) : skillStatus === 'in_progress' ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                        <span>◐</span> В процессе
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Не начато
                      </span>
                    )}
                  </div>
                  
                  {skill.description && <p className="text-sm text-gray-600 mb-3">{skill.description}</p>}
                  
                  {prereqNames.length > 0 && (
                    <div className="text-xs text-gray-500 mb-2">
                      <span className="font-medium">Требует:</span> {prereqNames.join(', ')}
                    </div>
                  )}
                  
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
          status={getSkillStatusForSkill(selectedSkill.id)} // ✅ Исправлено: передаем status вместо isMastered
          userId={currentUser?.id || null}
          onUpdateStatus={handleUpdateSkillStatus}
          onClose={() => setSelectedSkill(null)}
        />
      )}
    </div>
  );
};

export default SkillMapPage;