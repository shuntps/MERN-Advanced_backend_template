import bcrypt from 'bcryptjs';

export const hashValue = (value: string, saltRounds?: number) => bcrypt.hash(value, saltRounds || 10);

export const compareValue = (value: string, hashValue: string) =>
  bcrypt.compare(value, hashValue).catch(() => false);
