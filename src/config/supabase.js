// Supabase configuration
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const LOGIN_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_LOGIN_URL;
const LOGIN_SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_LOGIN_ANON_KEY;

const STORAGE_PREFIX = 'supabase.credentials';

if (!LOGIN_SUPABASE_URL || !LOGIN_SUPABASE_ANON_KEY) {
  console.warn(
    '[supabase] Missing login credentials. Set EXPO_PUBLIC_SUPABASE_LOGIN_URL and EXPO_PUBLIC_SUPABASE_LOGIN_ANON_KEY.'
  );
}

const createSupabaseInstance = (url, anonKey) => {
  if (!url || !anonKey) {
    return null;
  }
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

export const authSupabase = createSupabaseInstance(
  LOGIN_SUPABASE_URL,
  LOGIN_SUPABASE_ANON_KEY
);
export let supabase = authSupabase;

let activeCredentials = {
  userId: null,
  url: LOGIN_SUPABASE_URL || '',
  anonKey: LOGIN_SUPABASE_ANON_KEY || '',
  serviceRoleKey: null,
};

const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener(supabase);
    } catch (error) {
      console.error('[supabase] Listener error', error);
    }
  });
};

const storage = {
  async setItem(key, value) {
    try {
      if (SecureStore?.setItemAsync) {
        await SecureStore.setItemAsync(key, value);
        return;
      }
    } catch (error) {
      console.warn('[supabase] SecureStore setItemAsync failed', error);
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },
  async getItem(key) {
    try {
      if (SecureStore?.getItemAsync) {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.warn('[supabase] SecureStore getItemAsync failed', error);
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  async deleteItem(key) {
    try {
      if (SecureStore?.deleteItemAsync) {
        await SecureStore.deleteItemAsync(key);
        return;
      }
    } catch (error) {
      console.warn('[supabase] SecureStore deleteItemAsync failed', error);
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  },
};

const getStorageKey = (userId) =>
  userId ? `${STORAGE_PREFIX}:${userId}` : STORAGE_PREFIX;

export const onSupabaseClientChange = (listener) => {
  if (typeof listener !== 'function') return () => {};
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error(
      'Supabase client is not initialized. Verify credential configuration.'
    );
  }
  return supabase;
};

export const getAuthSupabaseClient = () => {
  if (!authSupabase) {
    throw new Error(
      'Login Supabase client is not configured. Check environment variables.'
    );
  }
  return authSupabase;
};

export const getActiveSupabaseCredentials = () => ({ ...activeCredentials });

export const setSupabaseCredentials = async (
  { userId, url, anonKey, serviceRoleKey },
  options = {}
) => {
  const { persist = true } = options;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase URL or anon key.');
  }

  const nextClient = createSupabaseInstance(url, anonKey);
  if (!nextClient) {
    throw new Error('Failed to initialize Supabase client with provided keys.');
  }

  supabase = nextClient;
  activeCredentials = {
    userId: userId ?? null,
    url,
    anonKey,
    serviceRoleKey: serviceRoleKey ?? null,
  };

  if (persist && userId) {
    const serialized = JSON.stringify({
      url,
      anonKey,
      serviceRoleKey: serviceRoleKey ?? null,
    });
    await storage.setItem(getStorageKey(userId), serialized);
  }

  notifyListeners();
  return supabase;
};

export const loadStoredSupabaseCredentials = async (userId) => {
  if (!userId) return null;
  const raw = await storage.getItem(getStorageKey(userId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.url || !parsed?.anonKey) {
      return null;
    }
    await setSupabaseCredentials(
      { userId, ...parsed },
      { persist: false }
    );
    return parsed;
  } catch (error) {
    console.warn('[supabase] Failed to restore credentials', error);
    return null;
  }
};

export const clearSupabaseCredentials = async (userId) => {
  if (userId) {
    await storage.deleteItem(getStorageKey(userId));
  }
};

export const resetSupabaseClient = () => {
  supabase = authSupabase;
  activeCredentials = {
    userId: null,
    url: LOGIN_SUPABASE_URL || '',
    anonKey: LOGIN_SUPABASE_ANON_KEY || '',
    serviceRoleKey: null,
  };
  notifyListeners();
  return supabase;
};

