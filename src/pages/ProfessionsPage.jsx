import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, getApiError } from '../api/client';

const getProfessionCountLabel = (count) => {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'направлений';
  if (lastDigit === 1) return 'направление';
  if (lastDigit >= 2 && lastDigit <= 4) return 'направления';
  return 'направлений';
};

const ProfessionsPage = () => {
  const [professions, setProfessions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/professions')
      .then(({ data }) => setProfessions(data))
      .catch((err) => setError(getApiError(err, 'Не удалось загрузить список профессий')))
      .finally(() => setLoading(false));
  }, []);

  const filteredProfessions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('ru');
    if (!query) return professions;

    return professions.filter((profession) => (
      `${profession.name} ${profession.description || ''}`.toLocaleLowerCase('ru').includes(query)
    ));
  }, [professions, search]);

  if (loading) {
    return (
      <section aria-label="Загрузка профессий" className="space-y-6">
        <div className="h-9 w-64 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-36 animate-pulse border-t border-slate-200 bg-white/40" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section role="alert" className="border border-red-200 bg-red-50 p-6 text-red-800">
        <h1 className="text-xl font-semibold">Не удалось загрузить профессии</h1>
        <p className="mt-2 text-sm">{error}</p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <nav aria-label="Хлебные крошки" className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="transition hover:text-purple-800">Главная</Link>
        <ChevronRight aria-hidden="true" size={13} />
        <span className="font-medium text-slate-800">Профессии</span>
      </nav>

      <header className="grid gap-7 border-b border-[#d6c3b0] pb-8 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-purple-800">
            <span className="h-px w-8 bg-purple-700" />
            Каталог направлений
          </p>
          <h1 className="mt-4 text-4xl font-medium text-slate-950 sm:text-5xl">
            Выберите профессию
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Посмотрите на структуру навыков и выберите направление, которое хотите изучить.
          </p>
        </div>

        <label className="relative block w-full sm:w-72">
          <span className="sr-only">Поиск профессий</span>
          <Search
            aria-hidden="true"
            size={18}
            className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Найти направление"
            className="w-full border-0 border-b border-slate-400 bg-transparent py-3 pl-7 pr-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-purple-700 focus:ring-0"
          />
        </label>
      </header>

      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
        <span>
          {filteredProfessions.length === professions.length
            ? `${professions.length} ${getProfessionCountLabel(professions.length)}`
            : `Найдено: ${filteredProfessions.length}`}
        </span>
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="border-b border-slate-400 pb-0.5 normal-case tracking-normal transition hover:border-purple-700 hover:text-purple-800"
          >
            Сбросить поиск
          </button>
        )}
      </div>

      {filteredProfessions.length > 0 ? (
        <div className="grid gap-x-8 sm:grid-cols-2">
          {filteredProfessions.map((profession, index) => (
            <article
              key={profession.id}
              className="group border-t border-[#d6c3b0] px-3 py-6 transition-colors hover:bg-[#f5e4d7] sm:px-4"
            >
              <div className="flex items-start gap-4">
                <span className="mt-1 font-serif text-lg text-purple-700">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-medium text-slate-950">
                    <Link
                      to={`/professions/${profession.id}/setup`}
                      className="transition hover:text-purple-800"
                    >
                      {profession.name}
                    </Link>
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                    {profession.description || 'Посмотрите навыки, связанные с этим направлением.'}
                  </p>
                  <Link
                    to={`/professions/${profession.id}/setup`}
                    aria-label={`Открыть карту навыков: ${profession.name}`}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-purple-800"
                  >
                    Изучить карту
                    <ArrowUpRight aria-hidden="true" size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="border-y border-[#d6c3b0] px-4 py-14 text-center">
          <h2 className="text-2xl font-medium text-slate-900">
            {professions.length ? 'Ничего не найдено' : 'Профессии пока недоступны'}
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            {professions.length
              ? 'Попробуйте изменить поисковый запрос.'
              : 'Загляните позже — каталог пока пуст.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfessionsPage;
