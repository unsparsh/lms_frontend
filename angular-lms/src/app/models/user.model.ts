export type UserRole = 'LIBRARIAN' | 'MEMBER';

export interface User {
  id: string;
  userId?: string; // UUID database ID fetched after login/register
  token: string;
  email: string;
  role: UserRole;
  name?: string;
  memberId?: string;
  membershipActive?: boolean;
  membershipStatus?: 'PENDING' | 'ACTIVE' | string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  id: string;
  userId?: string; // backend may return UUID userId
  token: string;
  email: string;
  role: UserRole;
}
