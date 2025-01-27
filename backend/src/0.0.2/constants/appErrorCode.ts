const enum AppErrorCode {
  AuthEmailAlreadyExists = 'AuthEmailAlreadyExists',
  AuthInvalidCredentials = 'AuthInvalidCredentials',
  AuthUserNotFound = 'AuthUserNotFound',
  AuthEmailNotVerified = 'AuthEmailNotVerified',
  AuthSessionExpired = 'AuthSessionExpired',
  AuthTooManyRequests = 'AuthTooManyRequests',
  InvalidAccessToken = 'InvalidAccessToken',
}

export default AppErrorCode;
