import { Team } from "../../types";
import { useMutation } from "@tanstack/react-query";
import { deleteTeam } from "../../api";
import { useCookie } from "../../hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export interface Props {
  team: Team;
}

export const TeamCard = ({ team }: Props) => {
  const { getCookie } = useCookie("token");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteMutation = useMutation(
    ["deleteTeam"],
    () => deleteTeam(getCookie() || "", team.id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["teams"] });
      },
    }
  );

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">{team.teamName}</h5>
        <h6 className="card-subtitle mb-2 text-muted">
          Division: {team.Category?.code}
        </h6>
        <p className="card-text text-muted">Team ID: {team.id}</p>
        <button
          className="btn btn-link"
          onClick={() => navigate(`/teams/${team.id}`)}
        >
          View
        </button>
        <button
          className="btn btn-link"
          onClick={() => navigate(`/teams/${team.id}/edit`)}
        >
          Edit
        </button>
        <button
          className="btn btn-link text-danger"
          onClick={() => deleteMutation.mutate()}
        >
          Delete
        </button>
      </div>
    </div>
  );
};
