import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import * as SecureStore from 'expo-secure-store';

// API error response data structure
export interface ApiErrorData {
  message?: string;
  code?: string | number;
  [key: string]: unknown;
}

// Error interface
export interface ApiError {
  status?: number;
  message: string;
  error?: ApiErrorData;
}

// Response wrapper
export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

// Request parameters object
export interface RequestParams {
  [key: string]: string | number | boolean | undefined | null | string[];
}

// API service class
export class ApiService {
  private client: AxiosInstance;
  private authToken: string | null = null;
  private onAuthError?: () => void;

  constructor(baseURL: string, timeout = 10000, onAuthError?: () => void) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout,
    });

    this.onAuthError = onAuthError;
    this.setupInterceptors();
  }

  // Set auth token
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  // Setup request/response interceptors
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth header if token exists
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Handle FormData automatically
        if (config.data instanceof FormData) {
          config.headers['Content-Type'] = 'multipart/form-data';
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorData>) => {
        // Handle authentication errors
        if (error.response?.status === 401 && this.onAuthError) {
          this.onAuthError();
        }

        // Standardize error format
        const apiError: ApiError = {
          status: error.response?.status,
          message:
            error.response?.data?.message ||
            error.message ||
            'Unknown error occurred',
          error: error.response?.data || { message: error.message },
        };

        return Promise.reject(apiError);
      }
    );
  }

  // Process parameters for GET requests
  private createParams(params?: RequestParams): URLSearchParams | undefined {
    if (!params) return undefined;

    const urlParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        value.forEach((item) => urlParams.append(key, String(item)));
      } else {
        urlParams.append(key, String(value));
      }
    });

    return urlParams;
  }

  // Generic request method
  private async request<T>(
    config: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await this.client(config);

    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>,
    };
  }

  // GET request
  async get<T>(url: string, params?: RequestParams): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      params: this.createParams(params),
    });
  }

  // GET blob (for file downloads)
  async getBlob(url: string, params?: RequestParams): Promise<Blob> {
    const response = await this.client.get(url, {
      params: this.createParams(params),
      responseType: 'blob',
    });
    return response.data;
  }

  // POST request
  async post<T, D = Record<string, unknown> | FormData>(
    url: string,
    data?: D
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
    });
  }

  // PUT request
  async put<T, D = Record<string, unknown> | FormData>(
    url: string,
    data?: D
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
    });
  }

  // DELETE request - supports both body data and URL params
  async delete<T, D = Record<string, unknown>>(
    url: string,
    dataOrParams?: D | RequestParams
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      data: dataOrParams,
    });
  }

  // PATCH request
  async patch<T, D = Record<string, unknown> | FormData>(
    url: string,
    data?: D
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
    });
  }

  // Upload file(s) - Adapted for React Native
  async upload<T>(
    url: string,
    file:
      | { uri: string; name: string; type: string }
      | { uri: string; name: string; type: string }[],
    fieldName = 'file',
    additionalData?: Record<string, string | number | boolean>,
    onProgress?: (percentage: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();

    // Add file(s)
    if (Array.isArray(file)) {
      file.forEach((f) => {
        formData.append(fieldName, {
          uri: f.uri,
          name: f.name,
          type: f.type,
        } as any);
      });
    } else {
      formData.append(fieldName, {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
    }

    // Add additional data
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
    }

    return this.request<T>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress
        ? (progressEvent) => {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 100)
            );
            onProgress(percentage);
          }
        : undefined,
    });
  }
}

// Auth error handler - will clear token and redirect to login
const handleAuthError = async () => {
  console.log('🔒 [API] Authentication error - clearing session');

  // Clear token from SecureStore
  await SecureStore.deleteItemAsync('auth-token');

  const authStore = await import('../store/authStore');
  try {
    const refresh = await SecureStore.getItemAsync('auth-refresh-token');
    await authStore.useAuthStore
      .getState()
      .logout(refresh as unknown as string);
  } catch {
    try {
      (
        authStore.useAuthStore.getState()
          .logout as unknown as () => Promise<void>
      )();
    } catch {
      /* ignore */
    }
  }
};

// Create and export the default API service instance
const apiService = new ApiService(
  process.env.EXPO_PUBLIC_API_URL || '',
  30000, // 30 second timeout for mobile
  handleAuthError
);

export default apiService;
