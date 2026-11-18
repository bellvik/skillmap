import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getResourcesByIds, getCategoryName } from '../data/mockData';

const SkillDetailModal = ({ skill, allSkills, isMastered, onClose }) => {
  // Закрытие по Esc (NFR-03: интуитивность)
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Резолв предпосылок в названия (FR-05: показать предпосылки, если заполнены)
  const prereqNames = (skill.prerequisites || [])
    .map(pid => allSkills.find(s => String(s.id) === String(pid))?.name)
    .filter(Boolean);

  // Ресурсы навыка (FR-06)
  const resources = getResourcesByIds(skill.resourceIds);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose} // клик по фону закрывает
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()} // клик внутри не закрывает
      >
        {/* Шапка */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{skill.name}</h2>
            <p className="text-sm text-gray-500 mt-1">Категория: {getCategoryName(skill.categoryId)}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Статус навыка (NFR-06: не только цвет, но и текст) */}
        <div className="mb-4">
          {isMastered ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded">
              <span>✓</span> Освоено
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded">
              <span>○</span> Не начато
            </span>
          )}
        </div>

        {/* Описание (FR-05 / RULE-02: блок скрыт, если поля нет, а не "undefined") */}
        {skill.description && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-1">Описание</h3>
            <p className="text-gray-600">{skill.description}</p>
          </div>
        )}

        {/* Предпосылки (FR-05) */}
        {prereqNames.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-1">Предпосылки</h3>
            <p className="text-gray-600">Сначала освойте: {prereqNames.join(', ')}</p>
          </div>
        )}

        {/* Ресурсы (FR-06 / альтернатива UC-5.1) */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Учебные ресурсы</h3>
          {resources.length === 0 ? (
            <p className="text-sm text-gray-500 italic bg-gray-50 border border-gray-200 rounded p-3">
              Учебные ресурсы пока не добавлены.
            </p>
          ) : (
            <ul className="space-y-2">
              {resources.map(res => (
                <li key={res.id} className="border border-gray-200 rounded-lg p-3">
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-purple-600 hover:text-purple-800 hover:underline"
                  >
                    {res.name}
                  </a>
                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                    <span>Тип: {res.type}</span>
                    <span>Язык: {res.language}</span>
                    {res.duration && <span>Длительность: {res.duration}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Действия гостя: RULE-01 + альтернатива UC-5.2 — предлагаем войти */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600 mb-3">
            Чтобы изменить статус навыка или добавить его в план обучения, войдите в аккаунт.
          </p>
          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
            >
              Войти
            </Link>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillDetailModal;