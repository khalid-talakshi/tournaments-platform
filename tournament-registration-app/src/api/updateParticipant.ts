import axios from "axios";
import { UserError } from "../types";

export const updateParticipant = async (
  formData: FormData,
  token: string,
  id?: number
): Promise<any | UserError> => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/participant/${id}`,
      formData,
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
