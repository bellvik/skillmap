import { useCallback } from 'react';
import { useAuth } from '../context/useAuth';
import { api } from '../api/client';

export const useSkillStatuses = () => {
  const { currentUser } = useAuth();

  const getUserMaps = useCallback(async () => {
    if (!currentUser) return [];
    const { data } = await api.get('/me/maps');
    return data;
  }, [currentUser]);

  const saveUserMap = useCallback(async (mapData) => {
    if (!currentUser) return;
    const { data } = await api.put(`/me/maps/${mapData.professionId}`, {
      level: mapData.level || 'beginner',
      skills: mapData.skills || [],
    });
    return data;
  }, [currentUser]);

  const updateSkillStatus = useCallback(async (professionId, skillId, status) => {
    if (!currentUser) return;
    const { data } = await api.put(`/me/maps/${professionId}/skills/${skillId}`, { status });
    return data;
  }, [currentUser]);

  const deleteUserMap = useCallback(async (professionId) => {
    if (!currentUser) return;
    await api.delete(`/me/maps/${professionId}`);
  }, [currentUser]);

  return {
    getUserMaps,
    saveUserMap,
    updateSkillStatus,
    deleteUserMap,
    currentUser
  };
};