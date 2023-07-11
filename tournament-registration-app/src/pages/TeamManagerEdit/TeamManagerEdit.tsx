import { TeamManagerForm } from "../../components";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCookie } from "../../hooks";
import { isUserError, TeamManager } from "../../types";
import { getTeamManager } from "../../api";

export const TeamManagerEdit = () => {
  const { cookie } = useCookie("token");
  const queryClient = useQueryClient();
  const { id } = useParams();
  const { data, isLoading, error } = useQuery(
    ["team-manager", cookie],
    getTeamManager
  );

  console.log(data);
  return (
    <div className="container">
      <h1>Edit Team Manager</h1>
      <TeamManagerForm teamManager={data as TeamManager} />
    </div>
  );
};
