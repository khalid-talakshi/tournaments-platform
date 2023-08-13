import { Modal } from "react-bootstrap";
import { Player } from "../../types";
import { useState } from "react";
import { updatePlayer } from "../../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface Props {
  player: Player;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  handleEdit: (jerseyNumber: number, teamId: number) => void;
}

export const PlayerEditModal = ({
  player,
  showModal,
  setShowModal,
  handleEdit,
}: Props) => {
  const [number, setNumber] = useState(player.jerseyNumber);
  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        Edit Jersey Number for {player.Participant?.name}
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <label htmlFor="jerseyNumber" style={{ paddingRight: "1em" }}>
            Jersey Number
          </label>
          <input
            type="number"
            min={0}
            max={99}
            className="form-control"
            onChange={(e) => setNumber(parseInt(e.target.value))}
            value={number}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button
          className="btn btn-secondary"
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={() => handleEdit(number, player.teamId)}
        >
          Save
        </button>
      </Modal.Footer>
    </Modal>
  );
};
