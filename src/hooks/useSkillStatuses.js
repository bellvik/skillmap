import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

// Хук для работы со статусами навыков пользователя
export const useSkillStatuses = () => {
  const { currentUser } = useAuth();

  // 1. Мемоизируем: ссылка на функцию не меняется между рендерами
  const getUserMaps = useCallback((userId) => {
    if (!userId) return [];
    
    try {
      const mapsData = localStorage.getItem(`skillmap_user_${userId}_maps`);
      return mapsData ? JSON.parse(mapsData) : [];
    } catch (e) {
      console.error('Ошибка парсинга карт из localStorage:', e);
      return [];
    }
  }, []); // Зависимостей нет, функция стабильна

  const saveUserMap = useCallback((userId, mapData) => {
    if (!userId) return;
    
    let userMaps = getUserMaps(userId);
    
    const existingIndex = userMaps.findIndex(map => 
      String(map.professionId) === String(mapData.professionId)
    );
    
    // FR-15: Обновляем существующую или добавляем новую
    if (existingIndex >= 0) {
      userMaps[existingIndex] = { ...userMaps[existingIndex], ...mapData, updatedAt: new Date().toISOString() };
    } else {
      userMaps.push({ ...mapData, updatedAt: new Date().toISOString() });
    }
    
    localStorage.setItem(`skillmap_user_${userId}_maps`, JSON.stringify(userMaps));
  }, [getUserMaps]);

  const getSkillStatus = useCallback((userId, professionId, skillId) => {
    if (!userId) return 'not_started';
    
    const userMaps = getUserMaps(userId);
    const userMap = userMaps.find(map => 
      String(map.professionId) === String(professionId)
    );
    
    if (!userMap || !userMap.skills) return 'not_started';
    
    const skillStatus = userMap.skills.find(s => 
      String(s.skillId) === String(skillId)
    );
    
    return skillStatus ? skillStatus.status : 'not_started';
  }, [getUserMaps]);

  const updateSkillStatus = useCallback((userId, professionId, skillId, newStatus) => {
    if (!userId) return;
    
    const userMaps = getUserMaps(userId);
    const userMapIndex = userMaps.findIndex(map => 
      String(map.professionId) === String(professionId)
    );
    
    if (userMapIndex < 0) {
      const newMap = {
        professionId: String(professionId),
        professionName: '', // Можно дополнить при необходимости
        skills: [{ skillId: String(skillId), status: newStatus }]
      };
      saveUserMap(userId, newMap);
      return;
    }
    
    const skillIndex = userMaps[userMapIndex].skills.findIndex(s => 
      String(s.skillId) === String(skillId)
    );
    
    if (skillIndex >= 0) {
      userMaps[userMapIndex].skills[skillIndex].status = newStatus;
    } else {
      userMaps[userMapIndex].skills.push({
        skillId: String(skillId),
        status: newStatus
      });
    }
    
    // Обновляем updatedAt при изменении
    userMaps[userMapIndex].updatedAt = new Date().toISOString();
    localStorage.setItem(`skillmap_user_${userId}_maps`, JSON.stringify(userMaps));
  }, [getUserMaps, saveUserMap]);
  const deleteUserMap = useCallback((userId, professionId) => {
    if (!userId) return;
    
    let userMaps = getUserMaps(userId);
    // Оставляем только те карты, ID которых НЕ совпадает с удаляемым
    const filteredMaps = userMaps.filter(map => 
      String(map.professionId) !== String(professionId)
    );
    
    localStorage.setItem(`skillmap_user_${userId}_maps`, JSON.stringify(filteredMaps));
  }, [getUserMaps]);

  return {
    getUserMaps,
    saveUserMap,
    getSkillStatus,
    updateSkillStatus,
    deleteUserMap,
    currentUser
  };
};