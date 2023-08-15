import axios from "axios";
import { UserError } from "../types";

export const createParticipant = async (
  formData: FormData,
  token: string
): Promise<any | UserError> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/participant`,
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
