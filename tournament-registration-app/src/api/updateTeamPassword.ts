import axios from "axios";
import { TeamPayload, UserError } from "../types";

export const updateTeamPassword = async (
  id: Number,
  data: any,
  token: string
): Promise<any | UserError> => {
  try {
    console.log(id);
    console.log(typeof id);
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/teams/${id}`,
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
