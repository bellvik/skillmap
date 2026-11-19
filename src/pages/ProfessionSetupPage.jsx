import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProfessionById, getSkillsByProfession } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useSkillStatuses } from '../hooks/useSkillStatuses';

const LEVELS = [
  { value: 'beginner', label: 'Новичок' },
  { value: 'junior', label: 'Junior' },
  { value: 'middle', label: 'Middle' },
  { value: 'senior', label: 'Senior' },
];

const ProfessionSetupPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { saveUserMap } = useSkillStatuses();
  const [profession, setProfession] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedLevel, setSelectedLevel] = useState('beginner');
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);

  useEffect(() => {
    const loadData = () => {
      try {
        const prof = getProfessionById(id);
        if (!prof) {
          setError('Профессия не найдена');
          setLoading(false);
          return;
        }
        setProfession(prof);
        setSkills(getSkillsByProfession(id) || []);
        setLoading(false);
      } catch (e) {
        setError('Не удалось загрузить данные');
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleSkillToggle = (skillId) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId)
        ? prev.filter((sid) => sid !== skillId)
        : [...prev, skillId]
    );
  };

  const handleBuildMap = () => {
    if (currentUser) {
      // Формируем карту в формате, который ожидает useSkillStatuses:
      // skills: [{ skillId, status }]
      const skillsStatuses = skills.map(skill => ({
        skillId: skill.id,
        status: selectedSkillIds.some(sid => String(sid) === String(skill.id))
          ? 'mastered'
          : 'not_started',
      }));

      const mapData = {
        professionId: id,
        level: selectedLevel,
        skills: skillsStatuses,
        updatedAt: new Date().toISOString(),
      };

      // saveUserMap сам решит — добавить новую карту или обновить существующую (FR-15)
      saveUserMap(currentUser.id, mapData);
    } else {
      // Гость: старый формат (обратная совместимость)
      localStorage.setItem(
        `skillmap_profession_${id}`,
        JSON.stringify({
          professionId: id,
          level: selectedLevel,
          selectedSkillIds,
          updatedAt: new Date().toISOString(),
        })
      );
    }

    navigate(`/professions/${id}/map`);
  };

  // Состояние загрузки (скелетон по RULE-03)
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // Состояние ошибки / профессия не найдена (RULE-03)
  if (error || !profession) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {error || 'Профессия не найдена'}
        </h2>
        <p className="text-gray-600 mb-6">
          Возможно, эта профессия ещё не добавлена или была архивирована.
        </p>
        <Link
          to="/professions"
          className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Вернуться к списку профессий
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <Link
          to="/professions"
          className="text-purple-600 hover:text-purple-700 text-sm mb-2 inline-block"
        >
          ← Назад к профессиям
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {profession.name}
        </h1>
        <p className="text-gray-600">{profession.description}</p>
      </div>

      {/* Выбор уровня (FR-03) */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Ваш текущий уровень подготовки
        </h2>
        <div className="space-y-2">
          {LEVELS.map((level) => (
            <label
              key={level.value}
              className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-purple-400 transition-colors"
            >
              <input
                type="radio"
                name="level"
                value={level.value}
                checked={selectedLevel === level.value}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="mr-3 accent-purple-600"
              />
              <span className="text-gray-700">{level.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Чекбоксы навыков (FR-04) */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Отметьте навыки, которые вы уже освоили
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Если вы ничего не отметите, карта всё равно будет построена.
        </p>
        {skills.length === 0 ? (
          <p className="text-gray-500 italic">
            Для этой профессии пока нет навыков.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {skills.map((skill) => (
              <label
                key={skill.id}
                className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-purple-400 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedSkillIds.includes(skill.id)}
                  onChange={() => handleSkillToggle(skill.id)}
                  className="mr-3 accent-purple-600"
                />
                <span className="text-gray-700">{skill.name}</span>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Кнопка построения карты */}
      <div className="flex gap-4">
        <button
          onClick={handleBuildMap}
          className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          Построить карту
        </button>
        <button
          onClick={() => navigate('/professions')}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  );
};

export default ProfessionSetupPage;