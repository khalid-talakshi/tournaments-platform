import axios from "axios";
import { UserError } from "../types";
export const deleteParticipant = async (
  token: string,
  id: number
): Promise<any> => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/participant/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response);
    return response.data as any;
  } catch (error: any) {
    return error.response.data as UserError;
  }
};
