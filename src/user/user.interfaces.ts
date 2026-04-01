export interface User {
  id: string; // uuid v4
  login: string;
  password: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: number; // timestamp of creation
  updatedAt: number; // timestamp of last update
}

export type UserWithoutPassword = Omit<User, 'password'>;
