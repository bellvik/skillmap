import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import ProfessionsPage from './pages/ProfessionsPage';
import LoginPage from './pages/LoginPage';
import ProfessionSetupPage from './pages/ProfessionSetupPage';
import SkillMapPage from './pages/SkillMapPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/professions" element={<ProfessionsPage />} />
        <Route path="/professions/:id/setup" element={<ProfessionSetupPage />} />
        <Route path="/professions/:id/map" element={<SkillMapPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
