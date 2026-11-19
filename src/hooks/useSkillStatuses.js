import { useAuth } from '../context/AuthContext';

// Хук для работы со статусами навыков пользователя
export const useSkillStatuses = () => {
  const { currentUser } = useAuth();

  // Получить все карты пользователя
  const getUserMaps = (userId) => {
    if (!userId) return [];
    
    const mapsData = localStorage.getItem(`skillmap_user_${userId}_maps`);
    return mapsData ? JSON.parse(mapsData) : [];
  };

  // Сохранить карту пользователя (добавляет или обновляет)
  const saveUserMap = (userId, mapData) => {
    if (!userId) return;
    
    // Получаем существующие карты
    let userMaps = getUserMaps(userId);
    
    // Проверяем, если карта с такой professionId уже существует
    const existingIndex = userMaps.findIndex(map => 
      String(map.professionId) === String(mapData.professionId)
    );
    
    if (existingIndex >= 0) {
      // Обновляем существующую карту
      userMaps[existingIndex] = { ...userMaps[existingIndex], ...mapData };
    } else {
      // Добавляем новую карту
      userMaps.push(mapData);
    }
    
    // Сохраняем обратно в localStorage
    localStorage.setItem(`skillmap_user_${userId}_maps`, JSON.stringify(userMaps));
  };

  // Получить статус навыка для конкретной карты
  const getSkillStatus = (userId, professionId, skillId) => {
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
  };

  // Обновить статус навыка
  const updateSkillStatus = (userId, professionId, skillId, newStatus) => {
    if (!userId) return;
    
    const userMaps = getUserMaps(userId);
    const userMapIndex = userMaps.findIndex(map => 
      String(map.professionId) === String(professionId)
    );
    
    if (userMapIndex < 0) {
      // Если карта не найдена, создаем новую
      const newMap = {
        professionId: professionId,
        skills: [{
          skillId: skillId,
          status: newStatus
        }]
      };
      saveUserMap(userId, newMap);
      return;
    }
    
    // Обновляем или добавляем статус навыка
    const skillIndex = userMaps[userMapIndex].skills.findIndex(s => 
      String(s.skillId) === String(skillId)
    );
    
    if (skillIndex >= 0) {
      // Обновляем существующий статус
      userMaps[userMapIndex].skills[skillIndex].status = newStatus;
    } else {
      // Добавляем новый статус навыка
      userMaps[userMapIndex].skills.push({
        skillId: skillId,
        status: newStatus
      });
    }
    
    // Сохраняем обновленную карту
    localStorage.setItem(`skillmap_user_${userId}_maps`, JSON.stringify(userMaps));
  };

  return {
    getUserMaps,
    saveUserMap,
    getSkillStatus,
    updateSkillStatus,
    currentUser
  };
};