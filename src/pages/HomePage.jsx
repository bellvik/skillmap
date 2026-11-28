import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const steps = [
  {
    number: '01',
    title: 'Выберите направление',
    description: 'Посмотрите, из чего складывается профессия и какие навыки в неё входят.',
  },
  {
    number: '02',
    title: 'Соберите свою карту',
    description: 'Отметьте освоенное и определите, где сейчас находится ваш следующий шаг.',
  },
  {
    number: '03',
    title: 'Возвращайтесь к прогрессу',
    description: 'Изменяйте статусы навыков по мере обучения и следите за движением вперёд.',
  },
];

const skillNodes = [
  { className: 'left-[5%] top-[25%]', label: 'Основа', detail: 'фундаментальные знания' },
  { className: 'right-[5%] top-[25%]', label: 'Инструменты', detail: 'среда и технологии' },
  { className: 'left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2', label: 'Профессия', detail: 'карта навыков', primary: true },
  { className: 'left-[5%] bottom-[15%]', label: 'Практика', detail: 'опыт применения' },
  { className: 'right-[5%] bottom-[15%]', label: 'Развитие', detail: 'следующий уровень' },
];

const HomePage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-20 sm:space-y-24">
      <section className="grid items-center gap-12 border-b border-[#d6c3b0] pb-14 pt-2 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-20">
        <div>
          <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-purple-800">
            <span className="h-px w-8 bg-purple-700" />
            Карта профессионального развития
          </p>
          <h1 className="max-w-2xl text-5xl font-medium leading-[1.04] text-slate-950 sm:text-6xl lg:text-7xl">
            Профессия — это не точка. Это маршрут.
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
            SkillMap помогает увидеть, из чего складывается выбранная профессия,
            отметить освоенные навыки и понять, куда двигаться дальше.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              to="/professions"
              className="inline-flex items-center gap-3 border border-purple-800 bg-purple-700 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-purple-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700"
            >
              Смотреть направления
              <ArrowUpRight aria-hidden="true" size={17} />
            </Link>
            {currentUser ? (
              <Link
                to="/my-maps"
                className="border-b border-slate-500 pb-1 text-sm font-medium text-slate-700 transition hover:border-purple-700 hover:text-purple-800"
              >
                Мои карты
              </Link>
            ) : (
              <Link
                to="/login"
                className="border-b border-slate-500 pb-1 text-sm font-medium text-slate-700 transition hover:border-purple-700 hover:text-purple-800"
              >
                Войти в аккаунт
              </Link>
            )}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl border border-[#bd6a4e] bg-[#edb194] p-4 sm:p-6">
          <div className="flex items-center justify-between border-b border-[#bd6a4e]/60 pb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#743a29] sm:text-xs">
            <span>Схема развития</span>
            <span>SkillMap / 01</span>
          </div>
          <div className="relative mt-3 aspect-[1.12] overflow-hidden">
            <svg
              aria-hidden="true"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 size-full"
            >
              <path d="M25 29 L50 55 L75 29 M25 71 L50 55 L75 71" fill="none" stroke="#a64c30" strokeWidth="0.7" />
              <circle cx="25" cy="29" r="1.3" fill="#a64c30" />
              <circle cx="75" cy="29" r="1.3" fill="#a64c30" />
              <circle cx="25" cy="71" r="1.3" fill="#a64c30" />
              <circle cx="75" cy="71" r="1.3" fill="#a64c30" />
            </svg>
            {skillNodes.map((node) => (
              <div
                key={node.label}
                className={`absolute ${node.className} border px-3 py-3 shadow-[0_3px_0_rgba(80,35,20,0.12)] sm:px-4 sm:py-3.5 ${
                  node.primary
                    ? 'w-[46%] border-[#71301f] bg-[#883b27] text-[#fff5eb]'
                    : 'w-[40%] border-[#b96d50] bg-[#fff4e9] text-slate-900'
                }`}
              >
                <p className="text-sm font-semibold sm:text-base">{node.label}</p>
                <p className={`mt-1 text-[10px] leading-4 sm:text-xs ${
                  node.primary ? 'text-[#f6d4c2]' : 'text-slate-600'
                }`}>
                  {node.detail}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-[#bd6a4e]/60 pt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[#743a29] sm:text-xs">
            <span>Навыки</span>
            <span>Опыт</span>
            <span>Рост</span>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-800">Простой порядок</p>
            <h2 className="mt-3 text-3xl font-medium text-slate-950 sm:text-4xl">От интереса — к ясному плану</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-600">
            Не нужно угадывать, что изучать. Сначала разберитесь в структуре профессии.
          </p>
        </div>
        <ol className="grid border-y border-[#d6c3b0] md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.number}
              className={`py-6 md:py-7 ${
                index > 0 ? 'border-t border-[#d6c3b0] md:border-l md:border-t-0 md:pl-7' : ''
              } ${index < steps.length - 1 ? 'md:pr-7' : ''}`}
            >
              <p className="font-serif text-2xl text-purple-700">{step.number}</p>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col justify-between gap-6 border border-[#d7bd7b] bg-[#f4d58c] px-6 py-7 sm:flex-row sm:items-center sm:px-9 sm:py-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-800">Начните с любопытства</p>
          <h2 className="mt-2 text-2xl font-medium text-slate-950">Выберите направление, которое вам близко</h2>
        </div>
        <Link
          to="/professions"
          className="inline-flex shrink-0 items-center gap-2 border-b border-slate-900 pb-1 text-sm font-semibold text-slate-900 transition hover:border-purple-800 hover:text-purple-800"
        >
          Перейти в каталог
          <ArrowUpRight aria-hidden="true" size={16} />
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
