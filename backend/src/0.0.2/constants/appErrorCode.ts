const enum AppErrorCode {
  AuthEmailAlreadyExists = 'AuthEmailAlreadyExists',
  AuthInvalidCredentials = 'AuthInvalidCredentials',
  AuthEmailNotVerified = 'AuthEmailNotVerified',
  AuthSessionExpired = 'AuthSessionExpired',
  InvalidAccessToken = 'InvalidAccessToken',
}

export default AppErrorCode;
