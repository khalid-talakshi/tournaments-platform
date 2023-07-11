import axios from "axios";
import { UserError } from "../types";
export const deleteTeam = async (token: string, id: Number): Promise<any> => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/teams/${id}`,
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
