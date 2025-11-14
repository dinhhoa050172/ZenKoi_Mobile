import apiService from '../apiClient';

export enum UserRole {
  Manager = 'Manager',
  FarmStaff = 'FarmStaff',
  SaleStaff = 'SaleStaff',
  User = 'User',
}

export enum Gender {
  Male = 'Nam',
  Female = 'Nữ',
}

export interface UserDetail {
  id: number;
  dateOfBirth: string;
  gender: Gender;
  avatarURL: string;
  address: string;
  applicationUserId: number;
}

export interface User {
  fullName: string;
  role: UserRole;
  isDeleted: boolean;
  userDetail: UserDetail;
  isBlocked: boolean;
  id: number;
  userName: string;
  normalizedUserName: string;
  email: string;
  normalizedEmail: string;
  emailConfirmed: boolean;
  phoneNumber: string;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnabled: boolean;
  accessFailedCount: number;
}

// Interface for UserDetails/get-me API response
export interface UserMeProfile {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  avatarURL: string;
  address: string;
  role: string;
}

export interface UpdateUserDetails {
  dateOfBirth: string;
  gender: string;
  avatarURL: string;
  address: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  avatarURL: string;
  address: string;
}

export interface UserResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: User;
}

export interface UserMeResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: UserMeProfile;
}

export const userServices = {
  // Get current user profile (me)
  getMe: async (): Promise<UserMeResponse> => {
    const response = await apiService.get<UserMeResponse>(
      '/api/UserDetails/get-me'
    );
    return response.data;
  },

  // Update user details (if needed in the future)
  updateUserDetail: async (
    userDetail: UpdateUserDetails
  ): Promise<UserMeResponse> => {
    const response = await apiService.post<UserMeResponse, UpdateUserDetails>(
      '/api/UserDetails/create-update-user-detail',
      userDetail
    );
    return response.data;
  },

  // Update user avatar
  updateAvatar: async (avatarURL: string): Promise<UserMeResponse> => {
    const response = await apiService.put<
      UserMeResponse,
      { avatarURL: string }
    >('/api/UserDetails/update-avatar', { avatarURL });
    return response.data;
  },

  // Update user profile
  updateProfile: async (
    profileData: UpdateProfileRequest
  ): Promise<UserMeResponse> => {
    const response = await apiService.put<UserMeResponse, UpdateProfileRequest>(
      '/api/Users/profile',
      profileData
    );
    return response.data;
  },
};
