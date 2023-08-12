import { QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import { Player, UserError } from "../types";

export const getPlayers = async (
  context: QueryFunctionContext
): Promise<Player[] | null | UserError> => {
  try {
    const [_key, token] = context.queryKey;
    const response = await axios.get(
      `${
        import.meta.env.VITE_API_URL
      }/players?includeParticipant=true&includeTeam=true&includeCategory=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as Player[] | null;
  } catch (error: any) {
    return error.response.data as UserError;
  }
};
