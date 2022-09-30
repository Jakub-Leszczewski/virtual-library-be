import { SecureUserData } from './user';

export type CreateUserResponse = SecureUserData;
export type CreateAdminResponse = SecureUserData;
export type SendAdminTokenResponse = { ok: boolean };
