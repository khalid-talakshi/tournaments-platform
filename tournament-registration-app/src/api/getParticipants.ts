import { QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import { Participant, UserError } from "../types";

export const getParticipants = async (
  context: QueryFunctionContext
): Promise<Participant[] | null | UserError> => {
  try {
    const [_key, token] = context.queryKey;
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/participants?includeVerification=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as Participant[] | null;
  } catch (error: any) {
    return error.response.data as UserError;
  }
};
