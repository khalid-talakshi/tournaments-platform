import { useState } from "react";
import { CoachDeleteModal } from "../CoachDeleteModal";
import { useMutation } from "@tanstack/react-query";
import { deleteCoach } from "../../api";
import { Props } from "./CoachCard";

export const CoachCard = ({ coach }: Props) => {
  const [showModal, setShowModal] = useState(false);
  const { cookie } = useCookie("token");

  const deleteCoachMutation = useMutation(
    ["deleteCoach"],
    () => {
      deleteCoach(getCook);
    },
    {}
  );
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
        showModal
        setShowModal={setShowModal}
        coach={coach}
        handleDelete={() => {}}
      />
    </>
  );
};
