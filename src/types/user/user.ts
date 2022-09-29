import { UserRole } from './user-role';

export interface UserInterface {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  hashPwd: string;
  jwtId: string;
  role: UserRole;
}

export type SecureUserData = Omit<UserInterface, 'hashPwd' | 'jwtId'>;
