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
}

export interface UserError {
  message: string;
  code: ErrorCode;
}

export interface LoginResponse {
  token: string;
}

export const isUserError = (error: any): error is UserError => {
  return error && error.code !== undefined && error.message !== undefined;
};

export const isLoginResponse = (response: any): response is LoginResponse => {
  return response && response.token !== undefined;
};

export interface User {
  id: number;
  username: string;
  password: string;
  permission: string;
}

export interface TeamManager {
  id: number;
  firstName: string;
  lastName: string;
  dob: string;
  userId: number;
  headshot: string;
  User?: User;
}

export interface Team {
  id: number;
  teamName: string | null;
  createdAt: Date;
  updatedAt: Date;
  sid: number | null;
  category: string | null;
  teamManagerId: number | null;
  password: string | null;
}

export enum TeamCategory {
  B08 = "B08",
  B05 = "B05",
  G05 = "G05",
  M01 = "M01",
  M02 = "M02",
  M75 = "M75",
  M87 = "M87",
  W04 = "W04",
}

export const AllDivisions = [
  TeamCategory.B08,
  TeamCategory.B05,
  TeamCategory.G05,
  TeamCategory.W04,
  TeamCategory.M02,
  TeamCategory.M01,
  TeamCategory.M75,
  TeamCategory.M87,
];

export const DivisionToTitle = (division: TeamCategory) => {
  switch (division) {
    case TeamCategory.B08:
      return "Boys 12-14";
    case TeamCategory.B05:
      return "Boys 15-17";
    case TeamCategory.G05:
      return "Girls 15-17";
    case TeamCategory.M01:
      return "Mens 21+";
    case TeamCategory.M02:
      return "Mens 18-20";
    case TeamCategory.M75:
      return "Mens 35+";
    case TeamCategory.M87:
      return "Mens 47+";
    case TeamCategory.W04:
      return "Womens 18+";
  }
};

export const StringToDivision = (division?: string) => {
  switch (division) {
    case "B08":
      return TeamCategory.B08;
    case "B05":
      return TeamCategory.B05;
    case "G05":
      return TeamCategory.G05;
    case "W04":
      return TeamCategory.W04;
    case "M02":
      return TeamCategory.M02;
    case "M01":
      return TeamCategory.M01;
    case "M75":
      return TeamCategory.M75;
    case "M87":
      return TeamCategory.M87;
    default:
      return null;
  }
};

export interface TeamPayload {
  teamName?: string;
  category?: TeamCategory;
  password?: string;
}

export interface Participant {
  id: number;
  name: string;
  dob: string;
  email: string;
  parentEmail: string;
  phoneNumber: string;
  userId: number;
  gender: string;
  createdAt: string;
  updatedAt: string;
  headshotKey: string;
  photoIdKey: string;
  waiverKey: string;
  User?: User;
  Verification?: Verification;
}

export interface Verification {
  id: number;
  participantId: number;
  status: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export enum HeadshotType {
  HEADSHOT,
  IMAGEKEY,
}


