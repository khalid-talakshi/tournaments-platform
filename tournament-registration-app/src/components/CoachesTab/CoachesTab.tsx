import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCoaches } from "../../api";
import { useCookie } from "../../hooks";
import { Coach, UserError, isUserError } from "../../types";
import { CoachCard, CoachesCreateModal, PlayerCreateModal } from "..";
import { chunk } from "../../utilities";
import { useState } from "react";

export const CoachesTab = () => {
  const { cookie } = useCookie("token");
  const { data } = useQuery(["coaches", cookie], getCoaches);
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const renderBody = (data?: Coach[] | UserError) => {
    if (isUserError(data)) {
      return <p>{data.message}</p>;
    } else if (data && data.length > 0) {
      const coachesRow = chunk(data, 3);
      const coachesCards = coachesRow.map((row, index) => (
        <div className="row mt-2" key={index}>
          {row.map((coach: Coach) => {
            const team = coach.Team;
            return (
              <div className="col-md-4 mt-sm-2" key={coach.id}>
                <CoachCard coach={coach} />
              </div>
            );
          })}
        </div>
      ));
      return coachesCards;
    } else {
      return <p>You currently have no registered Coaches</p>;
    }
  };

  const handleHide = () => {
    setShowModal(false);
    queryClient.invalidateQueries(["coaches"]);
  };

  return (
    <>
      <div className="d-flex justify-content-between mt-2">
        <h2>Coaches</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Create Coach
        </button>
      </div>
      <div className="row mt-2">
        <p>
          If you want to be a coach for a team in the tournament, you must first
          create a coach profile. This profile will allow you field access for
          the tournament.
        </p>
      </div>
      {data && renderBody(data)}
      <CoachesCreateModal show={showModal} onHide={handleHide} />
    </>
  );
};
