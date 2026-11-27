import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const SkillDetailModal = ({ skill, allSkills, status, userId, onUpdateStatus, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const prereqNames = (skill.prerequisites || [])
    .map(pid => allSkills.find(s => String(s.id) === String(pid))?.name)
    .filter(Boolean);

  const resources = skill.resources || [];

  const STATUS_OPTIONS = [
    { value: 'not_started', label: 'Не начато', icon: '○', activeClass: 'bg-gray-600 text-white border-gray-600' },
    { value: 'in_progress', label: 'В процессе', icon: '◐', activeClass: 'bg-amber-500 text-white border-amber-500' },
    { value: 'mastered', label: 'Освоено', icon: '✓', activeClass: 'bg-green-600 text-white border-green-600' },
  ];

  const currentStatus = status || 'not_started';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 cursor-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{skill.name}</h2>
            <p className="text-sm text-gray-500 mt-1">Категория: {skill.categoryName || 'Общее'}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Бейдж текущего статуса (NFR-06) */}
        <div className="mb-4">
          {currentStatus === 'mastered' && (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded">
              <span>✓</span> Освоено
            </span>
          )}
          {currentStatus === 'in_progress' && (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded">
              <span>◐</span> В процессе
            </span>
          )}
          {currentStatus === 'not_started' && (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded">
              <span>○</span> Не начато
            </span>
          )}
        </div>

        {skill.description && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-1">Описание</h3>
            <p className="text-gray-600">{skill.description}</p>
          </div>
        )}

        {prereqNames.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-1">Предпосылки</h3>
            <p className="text-gray-600">Сначала освойте: {prereqNames.join(', ')}</p>
          </div>
        )}

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

        {/* ЕДИНСТВЕННЫЙ блок действий: авторизованный видит кнопки, гость — вход */}
        <div className="border-t border-gray-200 pt-4">
          {userId ? (
            <div>
              <p className="text-sm text-gray-700 mb-3 font-medium">Статус навыка:</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => onUpdateStatus(skill.id, opt.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      currentStatus === opt.value
                        ? opt.activeClass
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Чтобы изменить статус навыка или добавить его в план обучения, войдите в аккаунт.
              </p>
              <div className="flex gap-3">
                <Link
                  to="/login"
                  state={{ from: `/professions/${skill.professionId || ''}/map` }}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillDetailModal;