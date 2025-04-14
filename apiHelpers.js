// apiHelpers.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

// Token refresh state variables
let isRefreshing = false;
let refreshSubscribers = [];
let lastTokenRefresh = 0;
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

// Function to decode JWT token payload compatible with React Native
const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    // Split the token
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid token format');
      return null;
    }
    
    // Get the payload part (second part)
    const base64Url = parts[1];
    
    // React Native compatible base64 decoding
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    
    // Convert base64 to string using native Buffer in Node.js or manually in React Native
    let decodedData;
    try {
      // For React Native
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      let result = '';
      let i = 0;
      
      while (i < paddedBase64.length) {
        const enc1 = characters.indexOf(paddedBase64[i++]);
        const enc2 = characters.indexOf(paddedBase64[i++]);
        const enc3 = characters.indexOf(paddedBase64[i++]);
        const enc4 = characters.indexOf(paddedBase64[i++]);

        const chr1 = (enc1 << 2) | (enc2 >> 4);
        const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        const chr3 = ((enc3 & 3) << 6) | enc4;

        result += String.fromCharCode(chr1);
        if (enc3 !== 64) result += String.fromCharCode(chr2);
        if (enc4 !== 64) result += String.fromCharCode(chr3);
      }
      
      decodedData = decodeURIComponent(
        result
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch (e) {
      console.error('Base64 decoding error:', e);
      return null;
    }
    
    try {
      return JSON.parse(decodedData);
    } catch (e) {
      console.error('JSON parsing error:', e);
      return null;
    }
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Simplified token check - just consider if it's been a while since refresh
const isTokenExpiring = () => {
  // If it's been more than 10 minutes since last refresh, get new token
  return (Date.now() - lastTokenRefresh) > TOKEN_REFRESH_THRESHOLD;
};

// Function to add subscribers for token refresh
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Function to notify all subscribers with new token
const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach(callback => callback(newToken));
  refreshSubscribers = [];
};

// Maximum retry attempts for token refresh
const MAX_REFRESH_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Sleep utility function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to refresh token with retries
const refreshToken = async (retryCount = 0) => {
  // Prevent concurrent refreshes
  if (isRefreshing) {
    return new Promise(resolve => {
      subscribeTokenRefresh(newToken => {
        resolve(newToken);
      });
    });
  }

  isRefreshing = true;
  lastTokenRefresh = Date.now();

  try {
    const refresh = await AsyncStorage.getItem('refresh');
    if (!refresh) {
      console.warn('No refresh token available');
      throw new Error('No refresh token available');
    }

    // Add timeout to fetch to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const refreshResponse = await fetch(`${API_URL}/api/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!refreshResponse.ok) {
        // If we haven't reached max retries, try again
        if (retryCount < MAX_REFRESH_RETRIES) {
          isRefreshing = false;
          console.log(`Token refresh failed, retrying (${retryCount + 1}/${MAX_REFRESH_RETRIES})...`);
          await sleep(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
          return refreshToken(retryCount + 1);
        }
        throw new Error(`Failed to refresh token: ${refreshResponse.status}`);
      }

      const data = await refreshResponse.json();
      await AsyncStorage.setItem('access', data.access);
      console.log('Token refreshed successfully');
      
      isRefreshing = false;
      onTokenRefreshed(data.access);
      return data.access;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Handle timeout or network errors with retry
      if ((fetchError.name === 'AbortError' || fetchError.message.includes('Network request failed')) 
          && retryCount < MAX_REFRESH_RETRIES) {
        isRefreshing = false;
        console.log(`Token refresh network error, retrying (${retryCount + 1}/${MAX_REFRESH_RETRIES})...`);
        await sleep(RETRY_DELAY * (retryCount + 1));
        return refreshToken(retryCount + 1);
      }
      throw fetchError;
    }
  } catch (error) {
    console.error(`Token refresh failed (attempt ${retryCount + 1}/${MAX_REFRESH_RETRIES + 1}):`, error);
    
    // If we still have retries left
    if (retryCount < MAX_REFRESH_RETRIES) {
      isRefreshing = false;
      await sleep(RETRY_DELAY * (retryCount + 1));
      return refreshToken(retryCount + 1);
    }
    
    // Max retries reached, reset state but DON'T clear tokens yet
    // We'll let the calling function decide that based on repeated failures
    isRefreshing = false;
    refreshSubscribers = [];
    throw error;
  }
};

// Counter for consecutive authentication failures
let consecutiveAuthFailures = 0;
const MAX_AUTH_FAILURES = 5;
let lastAuthSuccess = Date.now();
const AUTH_RESET_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const fetchWithAuth = async (endpoint, options = {}) => {
  try {
    // If we've had a successful request recently, reset the failure counter
    if (Date.now() - lastAuthSuccess > AUTH_RESET_INTERVAL) {
      consecutiveAuthFailures = 0;
    }
    
    // If there have been too many consecutive failures, force navigation to login
    if (consecutiveAuthFailures >= MAX_AUTH_FAILURES) {
      console.warn('Too many authentication failures, redirecting to login...');
      await AsyncStorage.removeItem('access');
      await AsyncStorage.removeItem('refresh');
      consecutiveAuthFailures = 0;
      
      // Return a special error that will trigger a redirect
      return {
        ok: false,
        status: 401,
        authReset: true,
        json: () => Promise.resolve({ message: 'Sesión expirada. Por favor inicia sesión de nuevo.' })
      };
    }

    let access = await AsyncStorage.getItem('access');
    const refresh = await AsyncStorage.getItem('refresh');

    if (!access && !refresh) {
      return {
        ok: false,
        status: 401,
        authReset: true,
        json: () => Promise.resolve({ message: 'No hay sesión activa' })
      };
    }

    // Try to use existing access token without proactive refresh
    // Only refresh if we get a 401 response

    const authHeaders = {
      Authorization: `Bearer ${access}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: authHeaders,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // On success, reset failure counter and update success timestamp
      if (response.ok) {
        consecutiveAuthFailures = 0;
        lastAuthSuccess = Date.now();
        return response;
      }

      // Handle 401 errors by trying to refresh the token
      if (response.status === 401 && refresh) {
        try {
          const newToken = await refreshToken();
          
          // Retry the original request with new token
          const retryHeaders = {
            ...authHeaders,
            Authorization: `Bearer ${newToken}`,
          };

          const retryResponse = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: retryHeaders,
          });

          if (retryResponse.ok) {
            consecutiveAuthFailures = 0;
            lastAuthSuccess = Date.now();
          } else {
            consecutiveAuthFailures++;
          }

          return retryResponse;
        } catch (error) {
          console.error('Token refresh on 401 failed:', error);
          consecutiveAuthFailures++;
          
          // Return a response object with status 401 to be consistent
          return { 
            ok: false, 
            status: 401, 
            json: () => Promise.resolve({ message: 'Sesión caducada' }) 
          };
        }
      }

      // For non-401 errors, just return the response
      return response;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('Request timed out:', endpoint);
        return {
          ok: false,
          status: 408, // Request Timeout
          json: () => Promise.resolve({ message: 'La solicitud ha excedido el tiempo máximo' })
        };
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Network error in fetchWithAuth:', error);
    // Return a response-like object for consistent error handling
    return { 
      ok: false, 
      status: 0, 
      json: () => Promise.resolve({ message: 'Error de red' }) 
    };
  }
};
