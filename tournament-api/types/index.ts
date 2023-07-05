export enum ErrorCode {
  NO_USER_FOUND,
  INVALID_PASSWORD,
  PARTICIPANT_EXISTS_FOR_USER,
  PARTICIPANT_MISSING_FIELD,
  PARTICIPANT_MISSING_PARENT_EMAIL,
  INVALID_TOKEN,
  PARTICIPANT_NOT_FOUND,
  PARTICIPANT_INVALID_EMAIL,
  PARTICIPANT_INVALID_PARENT_EMAIL,
  TEAM_MANAGER_ALREADY_EXISTS,
  TEAM_MANAGER_DOES_NOT_EXIST,
  TM_INVALID_FIRST_NAME,
  TM_INVALID_LAST_NAME,
  TM_INVALID_DOB,
  NO_TEAM_MANAGER,
  TEAM_DUPLICATE_NAME,
  TEAM_NAME_INVALID,
  TEAM_CATEGORY_INVALID,
  TEAM_NOT_FOUND,
  MISSING_PLAYER_PARTICIPANT_ID,
  INVALID_PLAYER_PARTICIPANT_ID,
  USER_ALREADY_EXISTS,
  AWS_S3_UPLOAD_ERROR,
  TEAM_HAS_PLAYERS,
}

export enum TeamCategory {
  B05 = "B05",
  B08 = "B08",
  G05 = "G05",
  M01 = "M01",
  M02 = "M02",
  M75 = "M75",
  M87 = "M87",
  W04 = "W04",
}

export interface UserError {
  message: string;
  code: ErrorCode;
}

export interface UserTokenPayload {
  userId: number;
  permission: string;
}

// regex to check email
const emailPattern =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
export const emailRegex = new RegExp(emailPattern);
