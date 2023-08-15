import { TeamForm } from "../../components";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCookie } from "../../hooks";
import { isUserError, Team, TeamManager, DivisionToTitle } from "../../types";
import { getTeam } from "../../api";

export const TeamEdit = () => {
  const { cookie } = useCookie("token");
  const { id } = useParams();
  const { data, isLoading, error } = useQuery(["team", cookie, id], getTeam);
  const navigate = useNavigate();

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
      <h1>Edit Team</h1>
      <TeamForm team={data as Team} />
      <div className="row">
        <div className="col-12">
          <h2>Current Team Details</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-6">
          <h3>Team Name</h3>
          <p>{data?.teamName}</p>
        </div>
        <div className="col-6">
          <h3>Division</h3>
          <p>{DivisionToTitle(data?.category)}</p>
        </div>
      </div>
    </div>
  );
};
