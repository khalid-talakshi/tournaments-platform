import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookie } from "../../hooks";
import { Participant } from "../../types";
import { S3Image } from "../S3Image";
import { deleteParticipant } from "../../api";
import { useState } from "react";
import { Alert, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { verificationIcon, friendlyDate, friendlyTime } from "../../utilities";

export interface Props {
  participant: Participant;
  key?: any;
}

export const ParticipantCard = ({ participant, key }: Props) => {
  const queryClient = useQueryClient();
  const { getCookie } = useCookie("token");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const deleteParticipantMutation = useMutation(
    ["deleteParticipant"],
    () => deleteParticipant(getCookie() || "", participant.id),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["participants"] });
      },
    }
  );

  const handleDelete = () => {
    deleteParticipantMutation.mutate();
    setShowModal(false);
  };

  return (
    <>
      <div className="card" key={key}>
        <div className="card-header">
          <h5 className="card-title">{participant.name}</h5>
        </div>
        <S3Image imageKey={participant.headshotKey} token={getCookie() || ""} />
        <div className="card-body">
          <h5 className="card-text text-muted">ID: {participant.id}</h5>
          <p className="card-text">
            Date of Birth: {friendlyDate(participant.dob)}
            <br />
            Verification Status: {verificationIcon(participant)}
            {participant.Verification?.status}
          </p>

          <p className="card-text text-muted">
            Last Updated: {friendlyDate(participant.updatedAt)}{" "}
            {friendlyTime(participant.updatedAt)}
            <br />
            Last Verification Update:{" "}
            {friendlyDate(participant.Verification?.updatedAt || "")}{" "}
            {friendlyTime(participant.Verification?.updatedAt || "")}
          </p>
        </div>
        <div className="card-footer">
          <div className="d-flex flex-row">
            <button
              className="btn btn-primary me-1"
              onClick={() => navigate(`/participant/${participant.id}/edit`)}
            >
              Edit
            </button>
            <button
              className="btn btn-danger"
              onClick={() => setShowModal(true)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      <Modal show={showModal} onHide={() => {}}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Participant {participant.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            Are you sure you want to delete this participant? This is an
            irreversiable action, and if you choose to register again you will
            need to be re-verified.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
          <button
            className="btn btn-danger"
            onClick={() => handleDelete()}
            disabled={deleteParticipantMutation.isLoading}
          >
            Delete
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
