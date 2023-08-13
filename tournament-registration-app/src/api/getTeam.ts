import { QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import { UserError } from "../types";

export const getTeam = async (
  context: QueryFunctionContext
): Promise<any | null | UserError> => {
  try {
    const [_key, token, id] = context.queryKey;
    const response = await axios.get(
      `${
        import.meta.env.VITE_API_URL
      }/teams/${id}?includePlayers=true&includeCoaches=true&includeParticipants=true&includeVerification=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as any[] | null;
  } catch (error: any) {
    return error.response.data as UserError;
  }
};
