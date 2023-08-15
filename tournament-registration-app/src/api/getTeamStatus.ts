import { QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import { UserError } from "../types";

export const getTeamStatus = async (
  context: QueryFunctionContext
): Promise<any | null | UserError> => {
  try {
    const [_key, token, teamId] = context.queryKey;
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/teams/${teamId}/status`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as any | null;
  } catch (error: any) {
    return error.response.data as UserError;
  }
};
