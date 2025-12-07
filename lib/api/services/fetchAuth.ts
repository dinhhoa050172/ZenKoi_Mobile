import apiService from '../apiClient';

enum UserRole {
  Manager = 'Manager',
  FarmStaff = 'FarmStaff',
  SaleStaff = 'SaleStaff',
  User = 'User',
}

export interface LoginCredentials {
  userNameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  userName: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
}

export interface Token {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface LoginResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: Token;
}

export interface RegisterResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: {
    id: number;
    userName: string;
    emailAddress: string;
    phoneNumber: string;
  };
}

export interface LogoutResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: null;
}

export interface RenewTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface RenewTokenResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: Token;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: null;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
  confirmedNewPassword: string;
  token: string;
}

export interface ResetPasswordResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: null;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmedNewPassword: string;
}

export interface ChangePasswordResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: Token;
}

export interface SendOtpRequest {
  email: string;
}

export interface SendOtpResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: null;
}

export interface ExpoPushTokenResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: boolean;
}

export const authServices = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiService.post<LoginResponse, LoginCredentials>(
      '/api/Accounts/authen',
      credentials
    );
    return response.data;
  },

  logout: async (request: LogoutRequest): Promise<LogoutResponse> => {
    const response = await apiService.post<LogoutResponse, LogoutRequest>(
      '/api/accounts/sign-out',
      request
    );
    return response.data;
  },

  renewToken: async (
    request: RenewTokenRequest
  ): Promise<RenewTokenResponse> => {
    const response = await apiService.post<
      RenewTokenResponse,
      RenewTokenRequest
    >('/api/Accounts/renew-token', request);
    return response.data;
  },

  forgotPassword: async (
    request: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> => {
    const response = await apiService.post<
      ForgotPasswordResponse,
      ForgotPasswordRequest
    >('/api/Accounts/forgot-password', request);
    return response.data;
  },

  resetPassword: async (
    request: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> => {
    const response = await apiService.post<
      ResetPasswordResponse,
      ResetPasswordRequest
    >('/api/Accounts/reset-password', request);
    return response.data;
  },

  changePassword: async (
    request: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> => {
    const response = await apiService.post<
      ChangePasswordResponse,
      ChangePasswordRequest
    >('/api/Accounts/change-password', request);
    return response.data;
  },

  sendOtp: async (request: SendOtpRequest): Promise<SendOtpResponse> => {
    const response = await apiService.post<SendOtpResponse, SendOtpRequest>(
      '/api/Accounts/send-otp',
      request
    );
    return response.data;
  },

  // Send expo push token to backend
  sendExpoPushToken: async (
    expoPushToken: string
  ): Promise<ExpoPushTokenResponse> => {
    const response = await apiService.put<
      ExpoPushTokenResponse,
      { expoPushToken: string }
    >('/api/Accounts/update-push-token', { expoPushToken });
    return response.data;
  },
};
