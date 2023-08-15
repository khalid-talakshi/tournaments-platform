import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getTeam, getTeamStatus, updateTeamPassword } from "../../api";
import { useCookie } from "../../hooks";
import { Player } from "../../types";
import { verificationIcon } from "../../utilities";
import { useReducer, useState } from "react";
import { Alert } from "react-bootstrap";

const passwordReducer = (state: any, action: any) => {
  switch (action.type) {
    case "oldPassword":
      return { ...state, oldPassword: action.value };
    case "newPassword":
      return { ...state, newPassword: action.value };
    case "confirmPassword":
      return { ...state, confirmPassword: action.value };
    default:
      return state;
  }
};

export const TeamView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getCookie } = useCookie("token");
  const { data, isLoading } = useQuery(
    ["team", getCookie() || "", id],
    getTeam
  );
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const [state, dispatch] = useReducer(passwordReducer, {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const statusData = useQuery(
    ["team-status", getCookie() || "", id],
    getTeamStatus
  );

  console.log(data);

  const handleTeamStatus = () => {
    const {
      coachesVerified,
      playersVerified,
      minCoaches,
      maxCoaches,
      minPlayers,
      maxPlayers,
    } = statusData.data;
    const verified =
      coachesVerified &&
      playersVerified &&
      minCoaches &&
      minPlayers &&
      maxCoaches &&
      maxPlayers;
    if (verified) {
      return <div className="alert alert-success">Team is verified</div>;
    } else {
      return (
        <div className="alert alert-danger">
          Team is not verified: The following requirements aren't met:
          <ul>
            {coachesVerified ? null : <li>Coaches Aren't Verified</li>}
            {playersVerified ? null : <li>Players Aren't Verified</li>}
            {minCoaches ? null : <li>You don't have enough coaches</li>}
            {minPlayers ? null : <li>You don't have enough players</li>}
            {maxCoaches ? null : <li>You have too many coaches</li>}
            {maxPlayers ? null : <li>You have too many players</li>}
          </ul>
        </div>
      );
    }
  };

  const updateTeamPasswordMutation = useMutation(
    ["updateTeamPassword"],
    (data: any) => updateTeamPassword(parseInt(id!), data, getCookie() || ""),
    {
      onSuccess: (data) => {
        if (data.message) {
          setShowSuccess(false);
          setPasswordError(data.message);
        } else {
          setPasswordError(null);
          setShowSuccess(true);
        }
      },
    }
  );

  const handleUpdatePassword = () => {
    const { newPassword, confirmPassword } = state;
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }
    updateTeamPasswordMutation.mutate(state);
  };

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
            {data.Players.map((player: Player) => (
              <tr>
                <td>{player.Participant?.name}</td>
                <td>{player.jerseyNumber}</td>
                <td>
                  {verificationIcon(player.Participant!)}
                  {player.Participant?.Verification?.status}
                </td>
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
      return (
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Coach Name</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.Coaches.map((coach: any) => {
              return (
                <tr>
                  <td>{coach.Participant.name}</td>
                  <td>
                    {verificationIcon(coach.Participant)}
                    {coach.Participant.Verification.status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }
  };

  if (isLoading) return <div>Loading...</div>;

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
        <div className="col-md-4">
          <h2>Players</h2>
          {showTeamPlayers()}
        </div>
        <div className="col-md-4">
          <h2>Coaches</h2>
          {showTeamCoaches()}
        </div>
        <div className="col-md-4">
          <div className="card mb-2">
            <div className="card-header">
              <h5 className="card-title">Team Status</h5>
            </div>
            <div className="card-body">
              <p>
                A team needs to meet the following requirements to compete. As a
                Team Manager, it is your responsibility to ensure you meet all
                the requirements
              </p>
              {handleTeamStatus()}
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Update Password</h5>
            </div>
            <div className="card-body">
              <Alert variant="danger" show={Boolean(passwordError)}>
                <p className="mb-0">{passwordError}</p>
              </Alert>
              <Alert variant="success" show={showSuccess}>
                <p className="mb-0">Your team password has been updated</p>
              </Alert>
              <label htmlFor="oldPassword" className="form-label">
                Old Password
              </label>
              <input
                type="password"
                className="form-control"
                id="oldPassword"
                value={state.oldPassword}
                onChange={(e) =>
                  dispatch({ type: "oldPassword", value: e.target.value })
                }
              />
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <input
                type="password"
                className="form-control"
                id="newPassword"
                value={state.newPassword}
                onChange={(e) =>
                  dispatch({ type: "newPassword", value: e.target.value })
                }
              />
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                value={state.confirmPassword}
                onChange={(e) =>
                  dispatch({ type: "confirmPassword", value: e.target.value })
                }
              />
            </div>
            <div className="card-footer">
              <button
                className="btn btn-primary"
                onClick={() => handleUpdatePassword()}
              >
                {updateTeamPasswordMutation.isLoading && (
                  <span
                    className="spinner-grow spinner-grow-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                )}
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
