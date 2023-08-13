import axios from "axios";
import { Coach, CoachPayload, UserError } from "../types";

export const createCoach = async (
  token: string,
  data: CoachPayload
): Promise<Coach | UserError> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/coaches`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as Coach;
  } catch (error: any) {
    return error.response.data as UserError;
  }
};
