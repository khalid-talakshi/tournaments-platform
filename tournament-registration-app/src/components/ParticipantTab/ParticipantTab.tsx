import { useQuery } from "@tanstack/react-query";
import { getParticipants } from "../../api";
import { useCookie } from "../../hooks";
import { Participant, UserError, isUserError } from "../../types";

export const ParticipantTab = () => {
  const { cookie } = useCookie("token");
  const { data } = useQuery(["participants", cookie], getParticipants);

  console.log(data);

  const renderBody = (data?: Participant[] | UserError) => {
    if (isUserError(data)) {
      return <p>{data.message}</p>;
    } else if (data && data.length > 0) {
      return <p>You have participants</p>;
    } else {
      return <p>You currently have no registered participants</p>;
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between mt-2">
        <h2>Participants</h2>
        <button className="btn btn-primary">Create Participant</button>
      </div>
      <div className="row mt-2">
        <p>
          A participant is a profile for a person who wishes to compete in
          tournaments. Each participant will be verified to ensure age, gender,
          and other eligibility requirements are met. These profiles will be
          maintained over time so once you register you will not need to
          re-register for future tournaments.
        </p>
      </div>
      {data && renderBody(data)}
    </>
  );
};
