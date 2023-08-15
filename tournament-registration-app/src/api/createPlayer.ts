import axios from "axios";
import { PlayerPayload, UserError } from "../types";

export const createPlayer = async (
  token: string,
  data: PlayerPayload
): Promise<any | UserError> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/players`,
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
