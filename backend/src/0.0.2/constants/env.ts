const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;

  if (value === undefined) {
    throw Error(`Missing String environment variable for ${key}`);
  }

  return value;
};

// Environment settings
export const NODE_ENV = getEnv('NODE_ENV');
export const BACKEND_PORT = getEnv('BACKEND_PORT');

// Database configuration
export const MONGODB_URI = getEnv('MONGODB_URI');

// JWT, Cookie & Session configurations
export const JWT_REFRESH_TOKEN_SECRET = getEnv('JWT_REFRESH_TOKEN_SECRET');
export const JWT_ACCESS_TOKEN_SECRET = getEnv('JWT_ACCESS_TOKEN_SECRET');
export const JWT_REFRESH_TOKEN_EXPIRES_IN = Number(
  getEnv('JWT_REFRESH_TOKEN_EXPIRES_IN')
);
export const JWT_ACCESS_TOKEN_EXPIRES_IN = Number(
  getEnv('JWT_REFRESH_TOKEN_EXPIRES_IN')
);
export const JWT_COOKIE_REFRESH_EXPIRES_IN = Number(
  getEnv('JWT_COOKIE_REFRESH_EXPIRES_IN')
);
export const JWT_COOKIE_ACCESS_EXPIRES_IN = Number(
  getEnv('JWT_COOKIE_ACCESS_EXPIRES_IN')
);

// Email configurations
export const RESEND_EMAIL_SENDER = getEnv('RESEND_EMAIL_SENDER');
export const RESEND_API_KEY = getEnv('RESEND_API_KEY');

// Feature configurations
export const USER_IPS_RETENTION_LIMIT = Number(
  getEnv('USER_IPS_RETENTION_LIMIT')
);
export const AUTH_VERIFICATION_CODE_EXPIRES_IN = Number(
  getEnv('AUTH_VERIFICATION_CODE_EXPIRES_IN')
);
export const PASSWORD_RESET_CODE_EXPIRES_IN = Number(
  getEnv('PASSWORD_RESET_CODE_EXPIRES_IN')
);

// Application metadata
export const APP_NAME = getEnv('APP_NAME');
export const FRONTEND_URL = getEnv('FRONTEND_URL');

// Automatisations
export const CLEAN_USER_IPS_CRON_SCHEDULE = getEnv(
  'CLEAN_USER_IPS_CRON_SCHEDULE',
  '0 0 * * *'
);
