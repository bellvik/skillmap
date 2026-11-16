import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">Вход</h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Вход появится позже
          </p>
          <div className="flex justify-center">
            <Link 
              to="/" 
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;