export interface User {
  id: string; // uuid v4
  login: string;
  password: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: number; // timestamp of creation
  updatedAt: number; // timestamp of last update
}

export type UserWithoutPassword = Omit<User, 'password'>;

export interface CreateUserDto {
  login: string;
  password: string;
  role?: 'admin' | 'editor' | 'viewer'; // defaults to 'viewer'
}

export interface UpdatePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}
