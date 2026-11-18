// Mock data for professions, skills and resources
const mockData = {
  professions: [
    {
      id: 1,
      name: "Frontend-разработчик",
      description: "Создает интерактивные пользовательские интерфейсы для веб-приложений",
      status: "active",
      order: 1,
      skills: [1, 2, 3, 4, 5, 6]
    },
    {
      id: 2,
      name: "Data Scientist",
      description: "Анализирует данные для извлечения полезной информации и принятия решений",
      status: "active",
      order: 2,
      skills: [7, 8, 9, 10, 11, 12]
    },
    {
      id: 3,
      name: "DevOps-инженер",
      description: "Обеспечивает автоматизацию процессов разработки и деплоя",
      status: "active",
      order: 3,
      skills: [13, 14, 15, 16, 17, 18]
    }
  ],
  
  skills: [
    {
      id: 1,
      name: "HTML",
      categoryId: 1,
      description: "Структура веб-страниц",
      prerequisites: [],
      order: 1
    },
    {
      id: 2,
      name: "CSS",
      categoryId: 1,
      description: "Стилизация веб-страниц",
      prerequisites: [1],
      order: 2
    },
    {
      id: 3,
      name: "JavaScript",
      categoryId: 1,
      description: "Язык программирования для веба",
      prerequisites: [1, 2],
      order: 3
    },
    {
      id: 4,
      name: "React",
      categoryId: 1,
      description: "Библиотека для создания пользовательских интерфейсов",
      prerequisites: [3],
      order: 4
    },
    {
      id: 5,
      name: "TypeScript",
      categoryId: 1,
      description: "Строго типизированный язык программирования",
      prerequisites: [3],
      order: 5
    },
    {
      id: 6,
      name: "Git",
      categoryId: 2,
      description: "Система контроля версий",
      prerequisites: [],
      order: 1
    },
    {
      id: 7,
      name: "Python",
      categoryId: 3,
      description: "Язык программирования для анализа данных",
      prerequisites: [],
      order: 1
    },
    {
      id: 8,
      name: "NumPy",
      categoryId: 3,
      description: "Библиотека для работы с массивами данных",
      prerequisites: [7],
      order: 2
    },
    {
      id: 9,
      name: "Pandas",
      categoryId: 3,
      description: "Библиотека для анализа данных",
      prerequisites: [7, 8],
      order: 3
    },
    {
      id: 10,
      name: "Scikit-learn",
      categoryId: 3,
      description: "Библиотека машинного обучения",
      prerequisites: [7, 8, 9],
      order: 4
    },
    {
      id: 11,
      name: "SQL",
      categoryId: 3,
      description: "Язык запросов к базам данных",
      prerequisites: [],
      order: 5
    },
    {
      id: 12,
      name: "Jupyter Notebook",
      categoryId: 3,
      description: "Среда для анализа данных",
      prerequisites: [7],
      order: 6
    },
    {
      id: 13,
      name: "Docker",
      categoryId: 4,
      description: "Платформа контейнеризации",
      prerequisites: [],
      order: 1
    },
    {
      id: 14,
      name: "Kubernetes",
      categoryId: 4,
      description: "Платформа оркестрации контейнеров",
      prerequisites: [13],
      order: 2
    },
    {
      id: 15,
      name: "AWS",
      categoryId: 4,
      description: "Облачные сервисы Amazon",
      prerequisites: [],
      order: 3
    },
    {
      id: 16,
      name: "CI/CD",
      categoryId: 4,
      description: "Практики непрерывной интеграции и доставки",
      prerequisites: [13, 15],
      order: 4
    },
    {
      id: 17,
      name: "Linux",
      categoryId: 4,
      description: "Операционная система для серверов",
      prerequisites: [],
      order: 5
    },
    {
      id: 18,
      name: "Terraform",
      categoryId: 4,
      description: "Инструмент для инфраструктуры как кода",
      prerequisites: [15],
      order: 6
    }
  ],
  
  categories: [
    {
      id: 1,
      name: "Frontend",
      description: "Клиентская часть приложений"
    },
    {
      id: 2,
      name: "Version Control",
      description: "Системы контроля версий"
    },
    {
      id: 3,
      name: "Data Science",
      description: "Анализ данных и машинное обучение"
    },
    {
      id: 4,
      name: "DevOps",
      description: "Инструменты и практики DevOps"
    }
  ],

  resources: [
    {
      id: 1,
      name: "Учебник по HTML и CSS",
      url: "https://example.com/html-css-guide",
      type: "book",
      language: "ru",
      duration: "10 часов"
    },
    {
      id: 2,
      name: "Курс JavaScript от MDN",
      url: "https://developer.mozilla.org/ru/docs/Web/JavaScript",
      type: "course",
      language: "ru",
      duration: "8 часов"
    },
    {
      id: 3,
      name: "React документация",
      url: "https://reactjs.org/docs/getting-started.html",
      type: "documentation",
      language: "en",
      duration: null
    },
    {
      id: 4,
      name: "Python для начинающих",
      url: "https://pythonworld.ru/",
      type: "course",
      language: "ru",
      duration: "15 часов"
    },
    {
      id: 5,
      name: "Docker для начинающих",
      url: "https://docs.docker.com/get-started/",
      type: "tutorial",
      language: "en",
      duration: "6 часов"
    }
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
  // Приводим оба значения к строке для надежного сравнения
  const profession = mockData.professions.find(p => String(p.id) === String(professionId));
  
  if (!profession) return [];
  
  return profession.skills.map(skillId => 
    
    mockData.skills.find(s => String(s.id) === String(skillId))
  ).filter(skill => skill !== undefined);
};