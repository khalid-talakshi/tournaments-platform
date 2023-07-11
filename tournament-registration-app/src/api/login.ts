import axios from "axios";
import { LoginResponse, UserError } from "../types";

export const login = async (
  username: string,
  password: string
): Promise<LoginResponse | UserError> => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
      username,
      password,
    });
    return response.data as LoginResponse;
  } catch (error: any) {
    return error.response.data as UserError;
  }
};
