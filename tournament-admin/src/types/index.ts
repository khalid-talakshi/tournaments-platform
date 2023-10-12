export interface LoginResponse {
  token: string;
  checksum: string;
}

export interface UserError {
  message: string;
  code: ErrorCode;
}

export enum ErrorCode {
  INVALID_USERNAME = "INVALID_USERNAME",
  INVALID_PASSWORD = "INVALID_PASSWORD",
  UNKNOWN = "UNKNOWN",
}

export const isUserError = (error: any): error is UserError => {
  return error && error.code !== undefined && error.message !== undefined;
};
