export interface CreateUserDtoInterface {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface SendAdminTokenDtoInterface {
  email: string;
}
