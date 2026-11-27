import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, loading } = useAuth();

  // Пока происходит загрузка, можно отображать лоадер или ничего не показывать
  if (loading) {
    return null;
  }

  // Если пользователь авторизован, пропускаем его дальше
  if (currentUser) {
    if (adminOnly && currentUser.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
    return children;
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  // Сохраняем текущую страницу в location.state.from для последующего редиректа
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;