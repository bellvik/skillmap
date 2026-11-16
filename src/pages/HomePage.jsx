import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
        Добро пожаловать в SkillMap
      </h1>
      
      <p className="text-xl text-gray-700 dark:text-gray-300 mb-10">
        Платформа для построения и развития картины навыков профессионалов
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
        <Link 
          to="/professions" 
          className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
        >
          Выбрать профессию
        </Link>
        <Link 
          to="/login" 
          className="px-8 py-3 bg-transparent border-2 border-purple-600 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-800 transition-colors"
        >
          Войти
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Создавайте карту навыков</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Постройте детальную картину своих профессиональных навыков и компетенций
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Развивайтесь эффективно</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Получите рекомендации по развитию и прокладывайте путь к новым навыкам
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Делитесь с сообществом</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Делитесь своим опытом и нарабатывайте репутацию в профильной области
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;