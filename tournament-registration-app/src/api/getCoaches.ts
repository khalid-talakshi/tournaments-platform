import { QueryFunctionContext } from "@tanstack/react-query";
import axios from "axios";
import { Coach, Participant, UserError } from "../types";

export const getCoaches = async (
  context: QueryFunctionContext
): Promise<Coach[] | null | UserError> => {
  try {
    const [_key, token, id] = context.queryKey;
    const response = await axios.get(
      `${
        import.meta.env.VITE_API_URL
      }/coaches?includeCategory=true&includeParticipant=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as Coach[] | null;
  } catch (error: any) {
    return error.response.data as UserError;
  }
};
