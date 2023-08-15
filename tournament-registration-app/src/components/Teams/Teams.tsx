import { getTeams } from "../../api";
import { useQuery } from "@tanstack/react-query";
import { useCookie } from "../../hooks";
import { ErrorCode, isUserError } from "../../types";
import { useNavigate } from "react-router-dom";
import { TeamCard } from "../";
import { Team } from "../../types";
import { chunk } from "../../utilities";

export const Teams = () => {
  const { cookie } = useCookie("token");
  const { data } = useQuery(["teams", cookie], getTeams);
  const navigate = useNavigate();

  const renderTeamCards = (data?: Team[]) => {
    if (data && data.length > 0) {
      const chunked = chunk(data, 3);
      return chunked.map((chunk, index) => (
        <div className="row mt-2" key={index}>
          {chunk.map((team: Team) => (
            <div className="col-md-4 mt-sm-2" key={team.id}>
              <TeamCard team={team} />
            </div>
          ))}
        </div>
      ));
    } else if (isUserError(data) && data.code === ErrorCode.NO_TEAM_MANAGER) {
      return (
        <p>
          You're not a team manager yet, you can sign up on the Team Manager
          tab.
        </p>
      );
    } else {
      return <p>You don't have any teams yet.</p>;
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between mt-2">
        <h2>Teams</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/teams/create")}
          disabled={
            isUserError(data) && data.code === ErrorCode.NO_TEAM_MANAGER
          }
        >
          Create Team
        </button>
      </div>
      {renderTeamCards(data)}
    </>
  );
};
