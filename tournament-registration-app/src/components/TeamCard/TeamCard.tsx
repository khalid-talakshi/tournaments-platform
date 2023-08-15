import { Team } from "../../types";
import { useMutation } from "@tanstack/react-query";
import { deleteTeam } from "../../api";
import { useCookie } from "../../hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Modal, Spinner } from "react-bootstrap";

export interface Props {
  team: Team;
}

export const TeamCard = ({ team }: Props) => {
  const { getCookie } = useCookie("token");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const deleteMutation = useMutation(
    ["deleteTeam"],
    () => deleteTeam(getCookie() || "", team.id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["teams"],
        });
        queryClient.invalidateQueries({
          queryKey: ["players"],
        });
        queryClient.invalidateQueries({
          queryKey: ["coaches"],
        });
      },
    }
  );

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h5 className="card-title">{team.teamName}</h5>
        </div>
        <div className="card-body">
          <h6 className="card-subtitle mb-2 text-muted">
            Division: {team.Category?.code}
          </h6>
          <p className="card-text text-muted">Team ID: {team.id}</p>
        </div>
        <div className="card-footer">
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/teams/${team.id}`)}
          >
            View
          </button>
          <button
            className="btn btn-danger"
            style={{ marginLeft: "0.25rem" }}
            onClick={() => setShowModal(true)}
          >
            {deleteMutation.isLoading && (
              <span
                className="spinner-grow spinner-grow-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
            )}
            Delete
          </button>
        </div>
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Team {team.teamName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this team? This action cannot be
          undone. This will also delete all players and coaches associated with
          this team.
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              deleteMutation.mutate();
              setShowModal(false);
            }}
          >
            Delete
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
