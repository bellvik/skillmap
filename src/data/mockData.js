// Mock data for professions, skills, categories and resources
const mockData = {
  professions: [
    { id: 1, name: "Frontend-разработчик", description: "Создает интерактивные пользовательские интерфейсы для веб- applications", status: "active", order: 1, skills: [1, 2, 3, 4, 5, 6] },
    { id: 2, name: "Data Scientist", description: "Анализирует данные для извлечения полезной информации и построения прогнозов", status: "active", order: 2, skills: [7, 8, 9, 10, 11, 12] },
    { id: 3, name: "DevOps-инженер", description: "Обеспечивает автоматизацию процессов разработки, доставки и эксплуатации ПО", status: "active", order: 3, skills: [13, 14, 15, 16, 17, 18] },
    { id: 4, name: "Системный аналитик", description: "Переводит потребности бизнеса в согласованные технические требования к системе", status: "active", order: 4, skills: [19, 20, 21, 22, 23, 24] },
    { id: 5, name: "Бизнес-аналитик", description: "Исследует процессы организации, выявляет проблемы и формирует требования к улучшениям", status: "active", order: 5, skills: [25, 26, 27, 28, 29, 30] },
    { id: 6, name: "Продуктовый менеджер", description: "Отвечает за развитие цифрового продукта: от исследования рынка до оценки метрик", status: "active", order: 6, skills: [31, 32, 33, 34, 35, 36] },
    { id: 7, name: "QA-инженер (Manual)", description: "Проверяет качество ПО, выявляет несоответствия требованиям и предотвращает дефекты", status: "active", order: 7, skills: [37, 38, 39, 40, 41, 42] },
    { id: 8, name: "Системный администратор", description: "Поддерживает работоспособность серверов, сетей и корпоративных сервисов", status: "active", order: 8, skills: [43, 44, 45, 46, 47, 48] },
    { id: 9, name: "ML-инженер", description: "Разрабатывает и внедряет модели машинного обучения в прикладные системы", status: "active", order: 9, skills: [49, 50, 51, 52, 53, 54] },
    { id: 10, name: "Инженер данных (Data Engineer)", description: "Создает инфраструктуру для сбора, хранения и преобразования больших данных", status: "active", order: 10, skills: [55, 56, 57, 58, 59, 60] },
    { id: 11, name: "Разработчик 1С", description: "Разрабатывает и сопровождает прикладные решения на платформе «1С:Предприятие»", status: "active", order: 11, skills: [61, 62, 63, 64, 65, 66] }
  ],
  
  skills: [
    // --- Frontend (1-6) ---
    { id: 1, name: "HTML & CSS", categoryId: 1, description: "Основы разметки и стилизации веб-страниц", prerequisites: [], order: 1, resourceIds: [1] },
    { id: 2, name: "JavaScript", categoryId: 1, description: "Язык программирования для создания интерактивности на вебе", prerequisites: [1], order: 2, resourceIds: [2] },
    { id: 3, name: "React", categoryId: 1, description: "Библиотека для создания пользовательских интерфейсов", prerequisites: [2], order: 3, resourceIds: [3] },
    { id: 4, name: "TypeScript", categoryId: 1, description: "Строго типизированное расширение JavaScript", prerequisites: [2], order: 4, resourceIds: [] },
    { id: 5, name: "REST API", categoryId: 1, description: "Принципы взаимодействия клиент-сервер через HTTP", prerequisites: [2], order: 5, resourceIds: [] },
    { id: 6, name: "Git", categoryId: 7, description: "Система контроля версий кода", prerequisites: [], order: 6, resourceIds: [] },

    // --- Data Science (7-12) ---
    { id: 7, name: "Python", categoryId: 2, description: "Основной язык программирования для анализа данных", prerequisites: [], order: 1, resourceIds: [4] },
    { id: 8, name: "SQL", categoryId: 2, description: "Язык структурированных запросов к реляционным базам данных", prerequisites: [], order: 2, resourceIds: [7] },
    { id: 9, name: "Pandas & NumPy", categoryId: 2, description: "Библиотеки для манипуляции и анализа табличных данных", prerequisites: [7, 8], order: 3, resourceIds: [10] },
    { id: 10, name: "Scikit-learn", categoryId: 2, description: "Библиотека для классического машинного обучения", prerequisites: [9], order: 4, resourceIds: [] },
    { id: 11, name: "Статистика и A/B тесты", categoryId: 2, description: "Проверка гипотез, доверительные интервалы, метрики", prerequisites: [8], order: 5, resourceIds: [] },
    { id: 12, name: "Jupyter Notebook", categoryId: 2, description: "Интерактивная среда для анализа данных и визуализации", prerequisites: [7], order: 6, resourceIds: [] },

    // --- DevOps (13-18) ---
    { id: 13, name: "Linux (Bash)", categoryId: 3, description: "Основы администрирования ОС и работы в командной строке", prerequisites: [], order: 1, resourceIds: [] },
    { id: 14, name: "Docker", categoryId: 3, description: "Платформа для контейнеризации приложений", prerequisites: [13], order: 2, resourceIds: [5] },
    { id: 15, name: "Kubernetes", categoryId: 3, description: "Система оркестрации контейнеров", prerequisites: [14], order: 3, resourceIds: [9] },
    { id: 16, name: "CI/CD", categoryId: 3, description: "Практики непрерывной интеграции и доставки (GitLab CI, GitHub Actions)", prerequisites: [14], order: 4, resourceIds: [] },
    { id: 17, name: "Terraform (IaC)", categoryId: 3, description: "Управление инфраструктурой как кодом", prerequisites: [13], order: 5, resourceIds: [] },
    { id: 18, name: "Мониторинг (Prometheus/Grafana)", categoryId: 3, description: "Сбор метрик, логирование и алертинг", prerequisites: [14], order: 6, resourceIds: [] },

    // --- Системный аналитик (19-24) ---
    { id: 19, name: "Сбор и управление требованиями", categoryId: 4, description: "Выявление, декомпозиция и трассировка бизнес-требований", prerequisites: [], order: 1, resourceIds: [6] },
    { id: 20, name: "BPMN 2.0", categoryId: 4, description: "Нотация моделирования бизнес-процессов", prerequisites: [19], order: 2, resourceIds: [6] },
    { id: 21, name: "UML (Sequence, Activity)", categoryId: 4, description: "Визуальное моделирование поведения и структуры системы", prerequisites: [19], order: 3, resourceIds: [] },
    { id: 22, name: "Проектирование API (OpenAPI)", categoryId: 4, description: "Описание контрактов взаимодействия микросервисов", prerequisites: [19], order: 4, resourceIds: [8] },
    { id: 23, name: "Моделирование данных (ERD)", categoryId: 4, description: "Проектирование сущностей, атрибутов и связей в БД", prerequisites: [19], order: 5, resourceIds: [] },
    { id: 24, name: "Инструменты (Jira, Confluence, Draw.io)", categoryId: 7, description: "Работа с таск-трекерами и базами знаний", prerequisites: [], order: 6, resourceIds: [] },

    // --- Бизнес-аналитик (25-30) ---
    { id: 25, name: "Выявление потребностей бизнеса", categoryId: 4, description: "Интервью, фасилитация, анализ стейкхолдеров", prerequisites: [], order: 1, resourceIds: [] },
    { id: 26, name: "Моделирование AS-IS / TO-BE", categoryId: 4, description: "Описание текущего и целевого состояния процессов", prerequisites: [25], order: 2, resourceIds: [6] },
    { id: 27, name: "Расчет KPI и метрик", categoryId: 4, description: "Определение показателей эффективности и целей", prerequisites: [26], order: 3, resourceIds: [] },
    { id: 28, name: "Написание User Stories", categoryId: 4, description: "Формирование требований в формате пользовательских историй", prerequisites: [25], order: 4, resourceIds: [] },
    { id: 29, name: "Базовый SQL и Excel", categoryId: 2, description: "Самостоятельная выгрузка и первичный анализ данных", prerequisites: [], order: 5, resourceIds: [7] },
    { id: 30, name: "Презентация и защита решений", categoryId: 7, description: "Коммуникация с заказчиками и аргументация выводов", prerequisites: [27], order: 6, resourceIds: [] },

    // --- Продуктовый менеджер (31-36) ---
    { id: 31, name: "Product Vision и стратегия", categoryId: 4, description: "Формирование видения продукта и дорожной карты", prerequisites: [], order: 1, resourceIds: [] },
    { id: 32, name: "CustDev и исследования", categoryId: 4, description: "Проблемные интервью и проверка гипотез", prerequisites: [31], order: 2, resourceIds: [] },
    { id: 33, name: "Приоритизация (RICE, ICE)", categoryId: 4, description: "Управление продуктовым бэклогом и оценка ценности", prerequisites: [31], order: 3, resourceIds: [] },
    { id: 34, name: "Продуктовая аналитика", categoryId: 2, description: "Воронки, когорты, retention и анализ поведения", prerequisites: [33], order: 4, resourceIds: [] },
    { id: 35, name: "A/B тестирование", categoryId: 2, description: "Планирование и интерпретация продуктовых экспериментов", prerequisites: [34], order: 5, resourceIds: [] },
    { id: 36, name: "Юнит-экономика", categoryId: 4, description: "Расчет CAC, LTV, маржинальности и окупаемости", prerequisites: [31], order: 6, resourceIds: [] },

    // --- QA-инженер (37-42) ---
    { id: 37, name: "Теория тестирования", categoryId: 5, description: "Виды, уровни тестирования и жизненный цикл дефекта", prerequisites: [], order: 1, resourceIds: [] },
    { id: 38, name: "Техники тест-дизайна", categoryId: 5, description: "Классы эквивалентности, граничные значения, pairwise", prerequisites: [37], order: 2, resourceIds: [] },
    { id: 39, name: "Написание тест-кейсов", categoryId: 5, description: "Создание чек-листов и тестовой документации", prerequisites: [38], order: 3, resourceIds: [] },
    { id: 40, name: "Тестирование API (Postman)", categoryId: 5, description: "Проверка методов, заголовков, кодов ответа и схем", prerequisites: [37], order: 4, resourceIds: [8] },
    { id: 41, name: "SQL для тестировщика", categoryId: 2, description: "Проверка данных в БД и сверка результатов", prerequisites: [37], order: 5, resourceIds: [7] },
    { id: 42, name: "DevTools и баг-трекинг", categoryId: 7, description: "Работа с консолью браузера и оформление баг-репортов в Jira", prerequisites: [37], order: 6, resourceIds: [] },

    // --- Системный администратор (43-48) ---
    { id: 43, name: "Администрирование ОС", categoryId: 3, description: "Установка и настройка Windows Server / Linux", prerequisites: [], order: 1, resourceIds: [] },
    { id: 44, name: "Компьютерные сети", categoryId: 3, description: "TCP/IP, DNS, DHCP, VLAN, маршрутизация", prerequisites: [43], order: 2, resourceIds: [] },
    { id: 45, name: "Active Directory", categoryId: 3, description: "Управление пользователями, группами и групповыми политиками", prerequisites: [44], order: 3, resourceIds: [] },
    { id: 46, name: "Резервное копирование", categoryId: 3, description: "Настройка бэкапов и регламентов восстановления", prerequisites: [43], order: 4, resourceIds: [] },
    { id: 47, name: "Скриптинг (Bash/PowerShell)", categoryId: 3, description: "Автоматизация рутинных административных задач", prerequisites: [43], order: 5, resourceIds: [] },
    { id: 48, name: "Мониторинг (Zabbix)", categoryId: 3, description: "Отслеживание доступности сервисов и ресурсов", prerequisites: [44], order: 6, resourceIds: [] },

    // --- ML-инженер (49-54) ---
    { id: 49, name: "Python и алгоритмы", categoryId: 2, description: "Продвинутый Python, структуры данных и ООП", prerequisites: [], order: 1, resourceIds: [4] },
    { id: 50, name: "Математика для ML", categoryId: 2, description: "Линейная алгебра, матан, теория вероятностей", prerequisites: [49], order: 2, resourceIds: [] },
    { id: 51, name: "Feature Engineering", categoryId: 2, description: "Подготовка данных, работа с пропусками и кодирование", prerequisites: [50], order: 3, resourceIds: [] },
    { id: 52, name: "PyTorch / TensorFlow", categoryId: 2, description: "Создание и обучение нейронных сетей", prerequisites: [51], order: 4, resourceIds: [] },
    { id: 53, name: "Деплой моделей (FastAPI)", categoryId: 3, description: "Упаковка модели в микросервис и контейнеризация", prerequisites: [52, 14], order: 5, resourceIds: [] },
    { id: 54, name: "MLOps", categoryId: 3, description: "Трекинг экспериментов (MLflow) и мониторинг дрейфа данных", prerequisites: [53], order: 6, resourceIds: [] },

    // --- Инженер данных (55-60) ---
    { id: 55, name: "Продвинутый SQL", categoryId: 2, description: "Оконные функции, CTE, оптимизация сложных запросов", prerequisites: [], order: 1, resourceIds: [7] },
    { id: 56, name: "Python для ETL", categoryId: 2, description: "Написание скриптов для извлечения и очистки данных", prerequisites: [55], order: 2, resourceIds: [4] },
    { id: 57, name: "Оркестрация (Airflow)", categoryId: 2, description: "Построение расписаний и зависимостей пайплайнов", prerequisites: [56], order: 3, resourceIds: [] },
    { id: 58, name: "Распределенная обработка (Spark)", categoryId: 2, description: "Обработка больших данных в кластере", prerequisites: [56], order: 4, resourceIds: [] },
    { id: 59, name: "Хранилища данных (DWH)", categoryId: 2, description: "Моделирование Star Schema, работа с ClickHouse/Greenplum", prerequisites: [55], order: 5, resourceIds: [] },
    { id: 60, name: "Потоковая обработка (Kafka)", categoryId: 3, description: "Работа с брокерами сообщений и стримингом данных", prerequisites: [57], order: 6, resourceIds: [] },

    // --- Разработчик 1С (61-66) ---
    { id: 61, name: "Архитектура 1С:Предприятие", categoryId: 6, description: "Объектная модель: справочники, документы, регистры", prerequisites: [], order: 1, resourceIds: [] },
    { id: 62, name: "Язык запросов 1С и СКД", categoryId: 6, description: "Построение выборок, соединений и систем компоновки данных", prerequisites: [61], order: 2, resourceIds: [] },
    { id: 63, name: "Управляемые формы", categoryId: 6, description: "Разработка клиент-серверного взаимодействия в интерфейсе", prerequisites: [61], order: 3, resourceIds: [] },
    { id: 64, name: "Интеграции (HTTP, XML, JSON)", categoryId: 6, description: "Обмен данными с внешними системами через веб-сервисы", prerequisites: [62], order: 4, resourceIds: [] },
    { id: 65, name: "Оптимизация и администрирование", categoryId: 6, description: "Анализ технологического журнала, блокировки, обновление", prerequisites: [61], order: 5, resourceIds: [] },
    { id: 66, name: "Git для 1С (EDT)", categoryId: 7, description: "Командная разработка и версионирование конфигураций", prerequisites: [61], order: 6, resourceIds: [] }
  ],
  
  categories: [
    { id: 1, name: "Frontend & Web", description: "Клиентская разработка и веб-технологии" },
    { id: 2, name: "Data & Analytics", description: "Анализ данных, ML, SQL и математическая статистика" },
    { id: 3, name: "DevOps & Infrastructure", description: "Серверы, сети, контейнеризация и автоматизация" },
    { id: 4, name: "Analytics & Management", description: "Системный и бизнес-анализ, управление продуктом" },
    { id: 5, name: "QA & Testing", description: "Обеспечение качества и тестирование ПО" },
    { id: 6, name: "Enterprise (1C)", description: "Разработка и сопровождение на платформе 1С" },
    { id: 7, name: "General Tools", description: "Сквозные инструменты: Git, Jira, английский язык" }
  ],

  resources: [
    { id: 1, name: "Учебник по HTML и CSS", url: "https://code.mu/ru/markup/book/prime/", type: "book", language: "ru", duration: "10 часов" },
    { id: 2, name: "JavaScript от MDN", url: "https://developer.mozilla.org/ru/docs/Web/JavaScript", type: "course", language: "ru", duration: "8 часов" },
    { id: 3, name: "React документация", url: "https://react.dev/learn", type: "documentation", language: "en", duration: null },
    { id: 4, name: "Поколение Python: курс для начинающих", url: "https://stepik.org/course/58852", type: "course", language: "ru", duration: "20 часов" },
    { id: 5, name: "Docker для начинающих", url: "https://docs.docker.com/get-started/", type: "tutorial", language: "en", duration: "6 часов" },
    { id: 6, name: "Руководство по BPMN 2.0", url: "https://www.businessstudio.ru/articles/bpmn/bpmn_2_0/", type: "article", language: "ru", duration: "2 часа" },
    { id: 7, name: "Интерактивный тренажер по SQL", url: "https://stepik.org/course/63054", type: "course", language: "ru", duration: "15 часов" },
    { id: 8, name: "Тестирование API в Postman", url: "https://learning.postman.com/docs/getting-started/introduction/", type: "documentation", language: "en", duration: "3 часа" },
    { id: 9, name: "Kubernetes Crash Course", url: "https://www.youtube.com/watch?v=s_o8dwzRlu4", type: "video", language: "en", duration: "1.5 часа" },
    { id: 10, name: "Анализ данных с Pandas (Kaggle)", url: "https://www.kaggle.com/learn/pandas", type: "course", language: "en", duration: "4 часа" }
  ]
};

// Export functions
export const getProfessions = () => {
  return mockData.professions;
};

export const getProfessionById = (id) => {
  return mockData.professions.find(prof => String(prof.id) === String(id));
};

export const getSkillsByProfession = (professionId) => {
  const profession = mockData.professions.find(p => String(p.id) === String(professionId));
  if (!profession) return [];
  
  return profession.skills
    .map(skillId => mockData.skills.find(s => String(s.id) === String(skillId)))
    .filter(skill => skill !== undefined);
};

export const getResourcesByIds = (resourceIds) => {
  if (!resourceIds || resourceIds.length === 0) return [];
  return resourceIds
    .map(rid => mockData.resources.find(r => String(r.id) === String(rid)))
    .filter(Boolean);
};

export const getCategoryName = (categoryId) => {
  const cat = mockData.categories.find(c => String(c.id) === String(categoryId));
  return cat ? cat.name : 'Общее';
};

export default mockData;