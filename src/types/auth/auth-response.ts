import { SecureUserData } from '../user';

export type LoginResponse = SecureUserData;
export type LogoutResponse = { ok: true };
export type GetUserFromTokenResponse = SecureUserData;
