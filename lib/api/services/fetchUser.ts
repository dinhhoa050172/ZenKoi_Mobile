export enum UserRole {
  Manager = 'Manager',
  FarmStaff = 'FarmStaff',
  SaleStaff = 'SaleStaff',
  User = 'User',
}

export enum Gender {
  Male = 'Nam',
  Female = 'Nữ',
  Other = 'Khác',
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

export interface UserResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: User;
}
