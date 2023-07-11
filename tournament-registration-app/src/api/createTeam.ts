import axios from "axios";
import { TeamPayload, UserError } from "../types";

export const createTeam = async (
  data: TeamPayload,
  token: string
): Promise<any | UserError> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/teams`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as any;
  } catch (error: any) {
    return error.response.data as UserError;
  }
};
