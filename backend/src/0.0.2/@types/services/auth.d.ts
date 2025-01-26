export type RegisterDTO = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  ip: string;
};

export type LoginDTO = {
  email: string;
  password: string;
  userAgent?: string;
  ip: string;
};
