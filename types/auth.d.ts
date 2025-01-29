import { User } from 'firebase/auth';

export interface AuthUser extends User {
  stsTokenManager?: {
    accessToken: string;
    expirationTime: number;
    refreshToken: string;
  };
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}