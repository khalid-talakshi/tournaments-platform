import { useState } from "react";
import { Coach } from "../../types";
import { CoachDeleteModal } from "../CoachDeleteModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCoach } from "../../api";
import { useCookie } from "../../hooks";

export interface Props {
  coach: Coach;
}

export const CoachCard = ({ coach }: Props) => {
  const [showModal, setShowModal] = useState(false);
  const { getCookie } = useCookie("token");
  const queryClient = useQueryClient();

  const deleteCoachMutation = useMutation(
    ["deleteCoach"],
    () => deleteCoach(getCookie() || "", coach.id),
    {
      onSuccess: () => {
        setShowModal(false);
        queryClient.invalidateQueries(["coaches"]);
      },
    }
  );

  const handleDelete = () => {
    deleteCoachMutation.mutate();
  };

  return (
    <>
      <div className="card">
        <h5 className="card-header">{coach.Participant?.name}</h5>
        <div className="card-body">
          <p className="card-text my-0">Team: {coach.Team?.teamName}</p>
          <p className="card-text my-0">
            Division: {coach.Team?.Category?.code}
          </p>
          <p className="card-text my-0">
            Cetification: {coach.certification || "N/A"}
          </p>
        </div>
        <div className="card-footer">
          <div className="d-flex flex-row">
            <button
              className="btn btn-danger"
              onClick={() => setShowModal(true)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      <CoachDeleteModal
        showModal={showModal}
        setShowModal={setShowModal}
        coach={coach}
        handleDelete={handleDelete}
      />
    </>
  );
};
