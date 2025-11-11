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

// Hàng đợi cho các request bị lỗi 401
// (any vì chúng ta không biết kiểu của resolve/reject)
interface FailedRequestQueueItem {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

// API service class
export class ApiService {
  private client: AxiosInstance;
  private authToken: string | null = null;
  private onAuthError?: () => void;

  // --- Biến kiểm soát refresh token ---
  private isRefreshing = false;
  private failedQueue: FailedRequestQueueItem[] = [];

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
    // Cập nhật header mặc định của client khi token thay đổi
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  // Xử lý hàng đợi
  private processQueue(
    error: ApiError | null,
    token: string | null = null
  ): void {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  // Setup request/response interceptors
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Token giờ đã được quản lý bởi setAuthToken và defaults
        // nhưng chúng ta vẫn có thể check ở đây để đảm bảo
        if (this.authToken && !config.headers.Authorization) {
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
      async (error: AxiosError<ApiErrorData>) => {
        // Chuẩn hóa lỗi trước
        const apiError: ApiError = {
          status: error.response?.status,
          message:
            error.response?.data?.message ||
            error.message ||
            'Unknown error occurred',
          error: error.response?.data || { message: error.message },
        };

        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Chỉ xử lý lỗi 401 và request đó chưa được thử lại
        if (apiError.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Nếu đang refresh, thêm request vào hàng đợi
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest); // Gửi lại request với token mới
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          // Đánh dấu request này đã thử retry
          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Import động để tránh lỗi circular dependency
            const { useAuthStore } = await import('../store/authStore');

            // Gọi hàm renewAccessToken từ store của bạn
            const renewSuccess = await useAuthStore
              .getState()
              .renewAccessToken();

            if (renewSuccess) {
              console.log('🔄 [API] Token renewed, retrying original request');
              // Lấy token mới từ store (vì renewAccessToken đã cập nhật nó)
              const newToken = useAuthStore.getState().token;

              // Cập nhật header cho request gốc
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;

              // "Xả" hàng đợi: thực thi lại các request đã bị treo với token mới
              this.processQueue(null, newToken);

              // Gửi lại request gốc
              return this.client(originalRequest);
            } else {
              // Refresh thất bại (ví dụ: refresh token hết hạn)
              console.warn('🔒 [API] Token renew failed, logging out.');
              this.processQueue(apiError, null); // "Xả" hàng đợi với lỗi
              if (this.onAuthError) {
                this.onAuthError(); // Gọi hàm logout
              }
              return Promise.reject(apiError);
            }
          } catch (renewError: any) {
            console.error(
              'CRITICAL: Error during token renew process',
              renewError
            );
            this.processQueue(renewError, null); // "Xả" hàng đợi với lỗi
            if (this.onAuthError) {
              this.onAuthError(); // Gọi hàm logout
            }
            return Promise.reject(renewError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Trả về lỗi đã được chuẩn hóa
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
