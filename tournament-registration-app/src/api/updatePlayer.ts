import axios from "axios";
import { PlayerPayload, UserError } from "../types";

export const updatePlayer = async (
  token: string,
  playerId: number,
  data: { teamId: number; jerseyNumber: number }
): Promise<any | UserError> => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/players/${playerId}`,
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
