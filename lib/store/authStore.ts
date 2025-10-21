import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import apiService from '../api/apiClient';
import { Token, authServices } from '../api/services/fetchAuth';
import { User } from '../api/services/fetchUser';

// Storage keys
const AUTH_TOKEN_KEY = 'auth-token';
const AUTH_REFRESH_KEY = 'auth-refresh-token';
const AUTH_USER_KEY = 'auth-user';

export type AuthUser = Partial<User> & { id?: number | string };

// Helper function to decode JWT token
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
};

// Auth store state interface
interface AuthState {
  token: string | null;
  refreshToken?: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setToken: (token: string | null) => Promise<void>;
  setRefreshToken: (refreshToken: string | null) => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  login: (tokenOrTokenObj: string | Token, user?: AuthUser) => Promise<void>;
  logout: (refreshToken: string) => Promise<void>;
  renewAccessToken: () => Promise<boolean>;
  syncAuthState: () => Promise<void>;
  syncUserFromProfile: (user: AuthUser) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setToken: async (token) => {
    try {
      if (token) {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
        apiService.setAuthToken(token);
      } else {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        apiService.setAuthToken(null);
      }

      set({ token, isAuthenticated: !!token });
    } catch (err) {
      console.error('[AUTH] setToken error:', err);
      // still update in-memory state to avoid stuck UI
      set({ token: token || null, isAuthenticated: !!token });
    }
  },

  setRefreshToken: async (refreshToken) => {
    try {
      if (refreshToken) {
        await SecureStore.setItemAsync(AUTH_REFRESH_KEY, refreshToken);
      } else {
        await SecureStore.deleteItemAsync(AUTH_REFRESH_KEY);
      }
      // keep in-memory state
      set({ refreshToken: refreshToken || null });
    } catch (err) {
      console.error('[AUTH] setRefreshToken error:', err);
      set({ refreshToken: refreshToken || null });
    }
  },

  setUser: (user) => {
    if (user) {
      const state = get();
      const userWithId: AuthUser = { ...user };

      // Attempt to attach id from token if present
      if (state.token) {
        const decodedToken = decodeJWT(state.token);
        if (decodedToken && decodedToken.UserID) {
          userWithId.id = decodedToken.UserID;
          console.log(
            '💾 [SET USER] Added UserID from token:',
            decodedToken.UserID
          );
        }
      }

      set({ user: userWithId });
    } else {
      set({ user: null });
    }
  },

  login: async (tokenOrTokenObj, user) => {
    try {
      // Accept either raw token string or Token object
      let jwt: string;
      let refresh: string | null = null;

      if (typeof tokenOrTokenObj === 'string') {
        jwt = tokenOrTokenObj;
      } else {
        jwt = tokenOrTokenObj.accessToken;
        refresh = tokenOrTokenObj.refreshToken;
      }

      // Persist and set on apiService
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, jwt);
      apiService.setAuthToken(jwt);

      if (refresh) {
        await SecureStore.setItemAsync(AUTH_REFRESH_KEY, refresh);
      }
      set({ refreshToken: refresh || null });

      // Decode token and optionally check expiry
      const decoded = decodeJWT(jwt);

      // Build a minimal AuthUser from token claims
      let baseUser: AuthUser | null = null;
      if (decoded && (decoded as any).UserID) {
        const uid = (decoded as any).UserID;
        baseUser = {
          id: uid,
          userName: (decoded as any).unique_name || String(uid),
          fullName:
            (decoded as any).FullName || (decoded as any).unique_name || 'User',
          email: (decoded as any).email || '',
        };
      }

      // Merge server-provided user (if any) over the token-derived base
      const mergedUser: AuthUser | null = user
        ? ({
            ...(baseUser || {}),
            ...user,
            id: (decoded as any)?.UserID || user.id,
          } as AuthUser)
        : baseUser;

      // Update store
      set({ token: jwt, user: mergedUser || null, isAuthenticated: true });

      console.log('🔧 [AUTH INIT] Login successful:', {
        hasToken: !!jwt,
        user: mergedUser,
        isAuthenticated: true,
      });
    } catch (err) {
      console.error('[AUTH] login error:', err);
      throw err;
    }
  },

  logout: async (refreshToken) => {
    try {
      // Determine refresh token to use: param -> state -> storage
      let rt = refreshToken || get().refreshToken || null;
      if (!rt) {
        try {
          rt = await SecureStore.getItemAsync(AUTH_REFRESH_KEY);
        } catch {
          rt = null;
        }
      }

      if (rt) {
        try {
          // Use typed service which calls '/api/accounts/logout'
          await authServices.logout({ refreshToken: rt });
          console.log('🔌 [AUTH] Server logout called with refreshToken');
        } catch (err) {
          console.warn(
            '[AUTH] logout: server logout failed (continuing local cleanup)',
            err
          );
        }
      }

      // Clear local secure storage
      try {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(AUTH_REFRESH_KEY);
        await SecureStore.deleteItemAsync(AUTH_USER_KEY);
      } catch (err) {
        console.error('[AUTH] logout: failed to clear secure storage', err);
      }

      // Clear API client and in-memory state
      apiService.setAuthToken(null);
      set({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
      });
      console.log('🚪 [AUTH] Logged out successfully (local)');
    } catch (err) {
      console.error('[AUTH] logout unexpected error:', err);
      // Ensure local cleanup even on unexpected error
      try {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(AUTH_REFRESH_KEY);
        await SecureStore.deleteItemAsync(AUTH_USER_KEY);
      } catch {
        /* ignore */
      }
      apiService.setAuthToken(null);
      set({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
      });
    }
  },

  renewAccessToken: async () => {
    try {
      const state = get();
      const currentToken =
        state.token || (await SecureStore.getItemAsync(AUTH_TOKEN_KEY));
      const currentRefresh =
        state.refreshToken ||
        (await SecureStore.getItemAsync(AUTH_REFRESH_KEY));

      if (!currentToken || !currentRefresh) {
        console.warn('[AUTH] renewAccessToken: missing tokens');
        return false;
      }

      // Call renew token endpoint
      const resp = await authServices.renewToken({
        token: currentToken,
        refreshToken: currentRefresh,
      });
      if (resp && resp.result && resp.result.accessToken) {
        const newToken = resp.result.accessToken;
        const newRefresh = resp.result.refreshToken;

        // Persist
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, newToken);
        await SecureStore.setItemAsync(AUTH_REFRESH_KEY, newRefresh);
        apiService.setAuthToken(newToken);
        set({ token: newToken, refreshToken: newRefresh });
        console.log('[AUTH] renewAccessToken: token renewed');
        return true;
      }
      return false;
    } catch (err) {
      console.error('[AUTH] renewAccessToken failed:', err);
      return false;
    }
  },

  syncAuthState: async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      const state = get();

      console.log('🔄 [AUTH SYNC] Syncing auth state:', {
        hasStoredToken: !!storedToken,
        storeToken: !!state.token,
        storeUser: !!state.user,
      });

      const storeHasToken = !!state.token;
      const storageHasToken = !!storedToken;

      if (storeHasToken !== storageHasToken) {
        if (storageHasToken) {
          // Set the API token immediately when syncing from storage
          apiService.setAuthToken(storedToken as string);

          // Build minimal user from token
          let userData: AuthUser | null = null;
          const decoded = decodeJWT(storedToken as string);

          if (decoded && decoded.UserID) {
            userData = {
              id: decoded.UserID,
              userName: decoded.unique_name || String(decoded.UserID),
              fullName: decoded.FullName || decoded.unique_name || 'User',
              email: decoded.email || '',
            };
            console.log('🔄 [AUTH SYNC] Built user from token:', userData);
          }
          set({
            token: storedToken as string,
            user: userData,
            isAuthenticated: true,
          });
        } else {
          // Clear API token when no storage token
          apiService.setAuthToken(null);
          set({
            token: null,
            user: null,
            isAuthenticated: false,
          });
        }
      } else if (storeHasToken && state.token) {
        // Ensure API service has the token
        apiService.setAuthToken(state.token);

        // Restore user data if missing
        if (!state.user) {
          const decoded = decodeJWT(state.token);
          if (decoded && decoded.UserID) {
            const userData: AuthUser = {
              id: decoded.UserID,
              userName: decoded.unique_name || String(decoded.UserID),
              fullName: decoded.FullName || decoded.unique_name || 'User',
              email: decoded.email || '',
            };
            console.log(
              '🔄 [AUTH SYNC] Restoring missing user data:',
              userData
            );
            set({ user: userData });
          }
        }
      }
    } catch (error) {
      console.error('🔄 [AUTH SYNC] Failed to sync auth state:', error);
    }
  },

  syncUserFromProfile: async (user: AuthUser) => {
    console.log(
      '🔄 [SYNC USER] Syncing user from profile to auth store:',
      user
    );

    const state = get();
    const userWithId: AuthUser = { ...user };

    // Extract UserID from token if available
    if (state.token) {
      const decodedToken = decodeJWT(state.token);
      if (decodedToken && decodedToken.UserID) {
        userWithId.id = decodedToken.UserID;
        console.log(
          '🔄 [SYNC USER] Added UserID from token:',
          decodedToken.UserID
        );
      }
    }

    // Store user data in secure storage (optional - for caching)
    try {
      await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(userWithId));
    } catch (error) {
      console.error('🔄 [SYNC USER] Failed to store user data:', error);
    }

    // Update store
    set({ user: userWithId });
  },
}));

// Initialize auth state from storage
export const initializeAuth = async () => {
  try {
    const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);

    console.log('🔧 [AUTH INIT] Initializing auth state:', {
      hasStoredToken: !!storedToken,
    });

    if (storedToken) {
      // Set token in API service
      apiService.setAuthToken(storedToken);

      // Decode token to get user info
      const decoded = decodeJWT(storedToken);
      let userData: AuthUser | null = null;

      if (decoded && decoded.UserID) {
        userData = {
          id: decoded.UserID,
          userName: decoded.unique_name || String(decoded.UserID),
          fullName: decoded.FullName || decoded.unique_name || 'User',
          email: decoded.email || '',
        } as AuthUser;
      }

      // Update store
      useAuthStore.setState({
        token: storedToken,
        user: userData,
        isAuthenticated: true,
      });

      console.log('🔧 [AUTH INIT] Initialized with token and user data');
    } else {
      console.log('🔧 [AUTH INIT] No stored token found');
    }
  } catch (error) {
    console.error('🔧 [AUTH INIT] Failed to initialize auth:', error);
  }
};
