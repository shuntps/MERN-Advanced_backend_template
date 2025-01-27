const enum AppErrorCode {
  AuthEmailAlreadyExists = 'AuthEmailAlreadyExists',
  AuthInvalidCredentials = 'AuthInvalidCredentials',
  AuthUserNotFound = 'AuthUserNotFound',
  AuthEmailNotVerified = 'AuthEmailNotVerified',
  AuthSessionExpired = 'AuthSessionExpired',
  AuthTooManyRequests = 'AuthTooManyRequests',
  InvalidOrExpiredVerificationCode = 'InvalidOrExpiredVerificationCode',
  InvalidAccessToken = 'InvalidAccessToken',
}

export default AppErrorCode;
