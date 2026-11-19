import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute'; // <-- Импортируем защиту

import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import ProfessionsPage from './pages/ProfessionsPage';
import LoginPage from './pages/LoginPage';
import ProfessionSetupPage from './pages/ProfessionSetupPage';
import SkillMapPage from './pages/SkillMapPage';
import MyMapsPage from './pages/MyMapsPage';
import LearningPlanPage from './pages/LearningPlanPage';

// Опционально: компонент для страницы 404
const NotFound = () => (
  <div className="max-w-3xl mx-auto px-4 py-16 text-center">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Страница не найдена</h2>
    <p className="text-gray-600 mb-6">Извините, запрашиваемая страница не существует.</p>
    <a href="/" className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
      На главную
    </a>
  </div>
);

function App() {
  return (
    <Layout>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/" element={<HomePage />} />
        <Route path="/professions" element={<ProfessionsPage />} />
        <Route path="/professions/:id/setup" element={<ProfessionSetupPage />} />
        <Route path="/professions/:id/map" element={<SkillMapPage />} />
         <Route path="/professions/:id/plan" element={<LearningPlanPage />} />
        <Route path="/login" element={<LoginPage />} />
        

        {/* Защищенные маршруты (только для авторизованных) */}
        <Route 
          path="/my-maps" 
          element={
            <ProtectedRoute>
              <MyMapsPage />
            </ProtectedRoute>
          } 
        />
        
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } 
        />

        {/* Маршрут-заглушка для всех несуществующих путей (Best Practice) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default App;
