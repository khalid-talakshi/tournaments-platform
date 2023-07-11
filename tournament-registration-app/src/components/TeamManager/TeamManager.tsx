import { deleteTeamManager, getTeamManager } from "../../api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCookie } from "../../hooks";
import { isUserError, TeamManager } from "../../types";
import { useNavigate } from "react-router-dom";

export const TeamManagerTab = () => {
  const { cookie } = useCookie("token");
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery(
    ["team-manager", cookie],
    getTeamManager
  );
  const navigate = useNavigate();

  const deleteTeamManagerMutation = useMutation(
    ["deleteTeamManager"],
    () => deleteTeamManager(cookie || ""),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["team-manager"] });
      },
    }
  );

  const noTeamManagerMarkup = (
    <>
      <p>You currently aren't registered as a Team Manager</p>
      <p>
        Becoming a Team Manager allows you to create teams, and will give you
        field access for those teams. However, it also requires you to complete
        the team registration, including paying the team fees and updating
        jersey numbers. If you aren't able to complete these tasks, your teams
        will not be able to play, so only sign up if you can commit to these
        requirements
      </p>
      <button
        className="btn btn-primary"
        onClick={() => navigate("/team-manager/create")}
      >
        Create Team Manager Profile
      </button>
    </>
  );

  const friendlyDate = (dateStr: string) => {
    if (dateStr === "") {
      return "";
    }
    const date = Date.parse(dateStr);
    return new Date(date).toISOString().split("T")[0];
  };

  const hasTeamManagerMarkup = (
    <div className="row">
      <div className="col-md-4">
        {(data as TeamManager)?.headshot ? (
          <img
            src={`https://test-gold-cup.s3.ca-central-1.amazonaws.com/${(
              data as TeamManager
            ).headshot!}`}
            style={{ width: "100%", height: "auto" }}
            alt={(data as TeamManager)?.headshot}
          />
        ) : null}
      </div>
      <div className="col-md-8">
        <h2>Profile</h2>
        <h4>
          Name: {(data as TeamManager)?.firstName}{" "}
          {(data as TeamManager)?.lastName}
        </h4>
        <h4>Date of Birth: {friendlyDate((data as TeamManager)?.dob || "")}</h4>
        <div className="d-flex">
          <button
            className="btn btn-primary me-2 bg"
            onClick={() =>
              navigate(`/team-manager/${(data as TeamManager).id}/edit`)
            }
          >
            Edit Profile
          </button>
          <button
            className="btn btn-danger"
            onClick={() => deleteTeamManagerMutation.mutate()}
            disabled={deleteTeamManagerMutation.isLoading}
          >
            {deleteTeamManagerMutation.isLoading && (
              <span
                className="spinner-grow spinner-grow-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
            )}
            Delete Profile
          </button>
        </div>
      </div>
    </div>
  );

  const teamManagerMarkup = () => {
    if (isLoading) {
      return <p>Loading...</p>;
    } else if (!isUserError(data) && data?.id === undefined) {
      return noTeamManagerMarkup;
    } else if (!isUserError(data) && data.id) {
      return hasTeamManagerMarkup;
    } else {
      return null;
    }
  };

  return (
    <div>
      <h2>Team Manager</h2>
      {teamManagerMarkup()}
    </div>
  );
};
