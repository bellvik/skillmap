import { Link, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import ProfessionsPage from './pages/ProfessionsPage';
import LoginPage from './pages/LoginPage';
import ProfessionSetupPage from './pages/ProfessionSetupPage';
import SkillMapPage from './pages/SkillMapPage';
import MyMapsPage from './pages/MyMapsPage';
import LearningPlanPage from './pages/LearningPlanPage';

const NotFound = () => (
  <div className="mx-auto max-w-3xl py-16 text-center">
    <h2 className="text-2xl font-semibold text-slate-950">Страница не найдена</h2>
    <p className="mt-3 text-slate-600">Проверьте адрес или вернитесь на главную.</p>
    <Link to="/" className="mt-6 inline-flex rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700">
      На главную
    </Link>
  </div>
);

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/professions" element={<ProfessionsPage />} />
        <Route path="/professions/:id/setup" element={<ProfessionSetupPage />} />
        <Route path="/professions/:id/map" element={<SkillMapPage />} />
        <Route path="/professions/:id/plan" element={<LearningPlanPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/my-maps"
          element={
            <ProtectedRoute>
              <MyMapsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default App;
