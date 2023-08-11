import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getTeam } from "../../api";
import { useCookie } from "../../hooks";

export const TeamView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getCookie } = useCookie("token");
  const { data, isLoading } = useQuery(
    ["participant", getCookie() || "", id],
    getTeam
  );

  console.log(data);
  if (isLoading) return <div>Loading...</div>;

  const showTeamPlayers = () => {
    if (data.Players.length === 0) {
      return <div>No players</div>;
    } else {
      return (
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Player Name</th>
              <th scope="col">Jersey</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.Players.map((player) => (
              <tr>
                <td>{player.name}</td>
                <td>{player.jersey}</td>
                <td>{player.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  const showTeamCoaches = () => {
    if (data.Coaches.length === 0) {
      return <div>No coaches</div>;
    } else {
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Coach Name</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.Coaches.map((coach) => (
            <tr>
              <td>{coach.name}</td>
              <td>{coach.status}</td>
            </tr>
          ))}
        </tbody>
      </table>;
    }
  };

  return (
    <div className="container">
      <a
        className="icon-link my-2 icon-link-hover"
        style={{ cursor: "pointer", textDecoration: "none" }}
        onClick={() => {
          navigate(-1);
        }}
      >
        <i className="bi-arrow-left me-1"></i>Back
      </a>
      <h1>Dashboard for Team {data.teamName}</h1>
      <div className="row">
        <div className="col-md-3">
          <h2>Players</h2>
          {showTeamPlayers()}
        </div>
        <div className="col-md-3">
          <h2>Coaches</h2>
          {showTeamCoaches()}
        </div>
        <div className="col-md-3">
          <h2>Team Status</h2>
          <p>
            A team needs to meet the following requirements to compete. As a
            Team Manager, it is your responsibility to ensure you meet all the
            requirements
          </p>
          <p>Current Status: Pending</p>
        </div>
      </div>
    </div>
  );
};
