// Mock data for SkillMap application
export const mockProfessions = [
  {
    id: 1,
    name: "Веб-разработчик",
    description: "Специалист по созданию и поддержке веб-сайтов и веб-приложений",
    createdAt: "2023-01-15",
    updatedAt: "2023-01-15"
  },
  {
    id: 2,
    name: "UX/UI дизайнер",
    description: "Создает удобные и красивые интерфейсы для цифровых продуктов",
    createdAt: "2023-02-20",
    updatedAt: "2023-02-20"
  },
  {
    id: 3,
    name: "Data Scientist",
    description: "Анализирует большие объемы данных для принятия бизнес-решений",
    createdAt: "2023-03-10",
    updatedAt: "2023-03-10"
  }
];

export const mockSkills = [
  {
    id: 1,
    name: "React",
    category: "Frontend",
    level: "Intermediate",
    proficiency: 75,
    professionId: 1,
    createdAt: "2023-01-15",
    updatedAt: "2023-01-15"
  },
  {
    id: 2,
    name: "JavaScript",
    category: "Frontend",
    level: "Advanced",
    proficiency: 90,
    professionId: 1,
    createdAt: "2023-01-15",
    updatedAt: "2023-01-15"
  },
  {
    id: 3,
    name: "Tailwind CSS",
    category: "Frontend",
    level: "Intermediate",
    proficiency: 70,
    professionId: 1,
    createdAt: "2023-01-15",
    updatedAt: "2023-01-15"
  },
  {
    id: 4,
    name: "Figma",
    category: "Design",
    level: "Advanced",
    proficiency: 85,
    professionId: 2,
    createdAt: "2023-02-20",
    updatedAt: "2023-02-20"
  },
  {
    id: 5,
    name: "Python",
    category: "Data Science",
    level: "Advanced",
    proficiency: 88,
    professionId: 3,
    createdAt: "2023-03-10",
    updatedAt: "2023-03-10"
  }
];

export const mockResources = [
  {
    id: 1,
    title: "Документация React",
    url: "https://react.dev",
    type: "Documentation",
    description: "Официальная документация React",
    createdAt: "2023-01-15",
    updatedAt: "2023-01-15"
  },
  {
    id: 2,
    title: "Курс по Tailwind CSS",
    url: "https://tailwindcss.com/docs",
    type: "Course",
    description: "Обучение Tailwind CSS от официальных источников",
    createdAt: "2023-01-15",
    updatedAt: "2023-01-15"
  },
  {
    id: 3,
    title: "Дизайн-система Figma",
    url: "https://figma.com",
    type: "Design Tool",
    description: "Платформа для совместной работы над дизайнами",
    createdAt: "2023-02-20",
    updatedAt: "2023-02-20"
  }
];