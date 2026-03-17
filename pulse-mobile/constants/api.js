import Constants from 'expo-constants';

// Automatically resolve the backend host:
// - In Expo Go / dev client, use the same host the JS bundle came from (your machine's LAN IP)
// - In production builds or when manifest is unavailable, fall back to localhost
function getApiBase() {
  try {
    // expoConfig.hostUri is the LAN IP:port Expo is serving from, e.g. "192.168.1.5:8081"
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const host = hostUri.split(':')[0]; // strip the port
      return `http://${host}:8000/api`;
    }
  } catch {}
  return 'http://localhost:8000/api';
}

export const API_BASE = getApiBase();
