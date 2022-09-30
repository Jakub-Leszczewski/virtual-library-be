export interface AdminTokenInterface {
  id: string;
  email: string;
  token: string;
  expiredAt: Date;
}
