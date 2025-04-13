// apiHelpers.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

export const fetchWithAuth = async (endpoint, options = {}) => {
  const access = await AsyncStorage.getItem('access');
  const refresh = await AsyncStorage.getItem('refresh');

  const authHeaders = {
    Authorization: `Bearer ${access}`,
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: authHeaders,
  });

  if (response.status === 401 && refresh) {
    const refreshResponse = await fetch(`${API_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      await AsyncStorage.setItem('access', data.access);

      const retryHeaders = {
        ...authHeaders,
        Authorization: `Bearer ${data.access}`,
      };

      return await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: retryHeaders,
      });
    } else {
      // Refresh token inválido: sesión caducada
      await AsyncStorage.clear();
      return { status: 401, message: 'Sesión caducada' };
    }
  }

  return response;
};
