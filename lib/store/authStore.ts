import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import apiService from '../api/apiClient';
import { Token, authServices } from '../api/services/fetchAuth';
import {
  User,
  UserMeProfile,
  UserRole,
  userServices,
} from '../api/services/fetchUser';

// Storage keys
const AUTH_TOKEN_KEY = 'auth-token';
const AUTH_REFRESH_KEY = 'auth-refresh-token';
const AUTH_USER_KEY = 'auth-user';

export type AuthUser = Partial<User> & { id?: number | string };

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
  syncUserFromProfile: (user: AuthUser | UserMeProfile) => Promise<void>;
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
    set({ user: user || null });
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

      // Update store with token only, user will be set separately via syncUserFromProfile
      set({ token: jwt, user: user || null, isAuthenticated: true });

      console.log('🔧 [AUTH INIT] Login successful:', {
        hasToken: !!jwt,
        user: user,
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
      const storedRefreshToken =
        await SecureStore.getItemAsync(AUTH_REFRESH_KEY);
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

          set({
            token: storedToken as string,
            refreshToken: storedRefreshToken,
            isAuthenticated: true,
            isLoading: true,
          });

          // Try to get fresh user data from API
          try {
            console.log('🔄 [AUTH SYNC] Fetching fresh user data...');
            const userResponse = await userServices.getMe();

            if (userResponse.isSuccess && userResponse.result) {
              await get().syncUserFromProfile(userResponse.result);
              console.log('🔄 [AUTH SYNC] Fresh user data synced');
            } else {
              // No fallback, set user to null
              set({ user: null });
              console.log('🔄 [AUTH SYNC] No user data available');
            }
          } catch (error) {
            console.warn(
              '🔄 [AUTH SYNC] Failed to fetch fresh user data:',
              error
            );

            // Check if token is invalid
            if ((error as any)?.response?.status === 401) {
              console.log('🔄 [AUTH SYNC] Token invalid, clearing auth');
              await get().logout('');
              return;
            }

            // No fallback, clear user data
            set({ user: null });
          }

          set({ isLoading: false });
        } else {
          // Clear API token when no storage token
          apiService.setAuthToken(null);
          set({
            token: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else if (storeHasToken && state.token) {
        // Ensure API service has the token
        apiService.setAuthToken(state.token);

        // Restore user data if missing by calling getMe
        if (!state.user) {
          set({ isLoading: true });

          try {
            console.log('🔄 [AUTH SYNC] User missing, fetching from API...');
            const userResponse = await userServices.getMe();

            if (userResponse.isSuccess && userResponse.result) {
              await get().syncUserFromProfile(userResponse.result);
              console.log('🔄 [AUTH SYNC] Missing user data restored from API');
            } else {
              // No fallback, clear user data
              set({ user: null });
              console.log('🔄 [AUTH SYNC] No user data available');
            }
          } catch (error) {
            console.warn('🔄 [AUTH SYNC] Failed to restore user data:', error);
          }

          set({ isLoading: false });
        }
      }
    } catch (error) {
      console.error('🔄 [AUTH SYNC] Failed to sync auth state:', error);
      set({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  syncUserFromProfile: async (user: AuthUser | UserMeProfile) => {
    console.log(
      '🔄 [SYNC USER] Syncing user from profile to auth store:',
      user
    );

    // Convert UserMeProfile to AuthUser format
    let userWithId: AuthUser;
    if ('dateOfBirth' in user) {
      // This is a UserMeProfile from API
      const profile = user as UserMeProfile;
      userWithId = {
        id: profile.id,
        userName: profile.email, // Use email as username if not provided
        fullName: profile.fullName,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        // Note: UserMeProfile.role is string, AuthUser expects UserRole enum
        // We'll convert it in a safer way
      };

      // Try to convert role string to UserRole enum
      try {
        const roleValue = profile.role as keyof typeof UserRole;
        if (roleValue && UserRole[roleValue]) {
          userWithId.role = UserRole[roleValue];
        }
      } catch {
        console.warn('🔄 [SYNC USER] Could not convert role:', profile.role);
      }
    } else {
      // This is already an AuthUser
      userWithId = { ...(user as AuthUser) };
    }

    // Store user data in secure storage (optional - for caching)
    try {
      await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(userWithId));
    } catch (error) {
      console.error('🔄 [SYNC USER] Failed to store user data:', error);
    }

    // Update store
    set({ user: userWithId });
    console.log(
      '🔄 [SYNC USER] Successfully synced user to store:',
      userWithId
    );
  },
}));

// Initialize auth state from storage and fetch user profile
export const initializeAuth = async () => {
  try {
    const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    const storedRefreshToken = await SecureStore.getItemAsync(AUTH_REFRESH_KEY);

    console.log('🔧 [AUTH INIT] Initializing auth state:', {
      hasStoredToken: !!storedToken,
      hasStoredRefreshToken: !!storedRefreshToken,
    });

    if (storedToken) {
      // Set token in API service first
      apiService.setAuthToken(storedToken);

      // Set loading state
      useAuthStore.setState({
        token: storedToken,
        refreshToken: storedRefreshToken,
        isAuthenticated: true,
        isLoading: true,
      });

      try {
        // Call getMe API to fetch complete user profile
        console.log('🔧 [AUTH INIT] Calling getMe API...');
        const userResponse = await userServices.getMe();

        if (userResponse.isSuccess && userResponse.result) {
          console.log(
            '🔧 [AUTH INIT] getMe API successful:',
            userResponse.result
          );

          // Use syncUserFromProfile to properly convert and store user data
          await useAuthStore
            .getState()
            .syncUserFromProfile(userResponse.result);

          console.log('🔧 [AUTH INIT] User profile synced successfully');
        } else {
          console.warn(
            '🔧 [AUTH INIT] getMe API failed:',
            userResponse.message
          );

          useAuthStore.setState({
            user: null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('🔧 [AUTH INIT] getMe API error:', error);

        // Check if token is expired/invalid
        if ((error as any)?.response?.status === 401) {
          console.log(
            '🔧 [AUTH INIT] Token appears to be invalid, clearing auth state'
          );

          // Clear invalid tokens
          try {
            await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
            await SecureStore.deleteItemAsync(AUTH_REFRESH_KEY);
            await SecureStore.deleteItemAsync(AUTH_USER_KEY);
          } catch {}

          apiService.setAuthToken(null);
          useAuthStore.setState({
            token: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });

          return;
        }

        // For other errors, clear user data
        useAuthStore.setState({
          user: null,
          isLoading: false,
        });
      }

      // Clear loading state
      useAuthStore.setState({ isLoading: false });

      console.log('🔧 [AUTH INIT] Initialization completed');
    } else {
      console.log('🔧 [AUTH INIT] No stored token found');
      useAuthStore.setState({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  } catch (error) {
    console.error('🔧 [AUTH INIT] Failed to initialize auth:', error);
    useAuthStore.setState({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }
};
