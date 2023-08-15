import {
  AllDivisions,
  DivisionToTitle,
  StringToDivision,
  Team,
  TeamCategory,
  TeamPayload,
} from "../../types";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createTeam, updateTeam } from "../../api";
import { useCookie } from "../../hooks";
import { useNavigate } from "react-router-dom";

export interface Props {
  team?: Team;
}

export const TeamForm = ({ team }: Props) => {
  console.log(team);
  const [divivsion, setDivision] = useState<TeamCategory>(
    StringToDivision(team?.Category?.code || "") || AllDivisions[0]
  );
  const [teamName, setTeamName] = useState<string>(team?.teamName || "");
  const [password, setPassword] = useState<string>(team?.password || "");
  const [error, setError] = useState<string | null>(null);

  console.log(divivsion);
  console.log(teamName);

  const { getCookie } = useCookie("token");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("useEffect");
    if (team) {
      setDivision(
        StringToDivision(team.Category?.code || "") || AllDivisions[0]
      );
      setTeamName(team.teamName || "");
    }
  }, []);

  const createTeamMutation = useMutation(
    ["createTeam"],
    (data: TeamPayload) => createTeam(data, getCookie() || ""),
    {
      onSuccess: (data) => {
        if (data.error) {
          setError(data.error.message);
        } else {
          navigate("/dashboard?tab=teams");
        }
      },
    }
  );

  const updateTeamMutation = useMutation(
    ["updateTeam"],
    (data: TeamPayload) => updateTeam(team!.id, data, getCookie() || ""),
    {
      onSuccess: (data) => {
        if (data.error) {
          setError(data.error.message);
        } else {
          console.log(data);
          navigate("/dashboard");
        }
      },
    }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submit");
    console.log(Boolean(team));
    if (team) {
      updateTeamMutation.mutate({
        category: divivsion,
        teamName: teamName,
        password: password,
      });
    } else {
      createTeamMutation.mutate({
        category: divivsion,
        teamName: teamName,
        password: password,
      });
    }
  };

  console.log(error);

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-5 mt-sm-2">
          <label htmlFor="firstName" className="form-label">
            Team Name
          </label>
          <input
            type="text"
            className="form-control"
            id="teamName"
            placeholder="Team Name"
            onChange={(e) => setTeamName(e.target.value)}
            value={teamName}
          />
        </div>
        <div className="col-md-4 mt-sm-2">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <small id="emailHelp" className="form-text text-muted">
            If left empty, the password will be in the form
            "teamName-shortDivision", where teamName is your team name and
            shortDivision is the shortcode for you division (the 3 letter code)
          </small>
        </div>
        <div className="col-md-2 mt-sm-2">
          <label htmlFor="firstName" className="form-label">
            Division
          </label>
          <select
            className="form-select"
            aria-label="Default select example"
            onChange={(e) => setDivision(e.target.value as TeamCategory)}
            value={divivsion}
          >
            {AllDivisions.map((division) => (
              <option value={division} key={division}>
                {`${DivisionToTitle(division)} - ${division}`}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-1 d-flex mt-sm-2">
          <button type="submit" className="btn btn-primary align-self-end">
            Submit
          </button>
        </div>
      </div>
    </form>
  );
};
