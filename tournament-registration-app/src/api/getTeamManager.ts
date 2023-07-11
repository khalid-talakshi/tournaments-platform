import { QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import { LoginResponse, TeamManager, UserError } from "../types";

export const getTeamManager = async (
  context: QueryFunctionContext
): Promise<TeamManager | null | UserError> => {
  try {
    const [_key, token] = context.queryKey;
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/team-manager`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as TeamManager | null;
  } catch (error: any) {
    return error.response.data as UserError;
  }
};
