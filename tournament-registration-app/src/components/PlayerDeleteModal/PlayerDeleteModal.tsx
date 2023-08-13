import { Modal } from "react-bootstrap";
import { Player } from "../../types";

export interface Props {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  handleDelete: () => void;
  player: Player;
}

export const PlayerDeleteModal = ({
  showModal,
  setShowModal,
  handleDelete,
  player,
}: Props) => {
  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        Delete Player {player.Participant?.name}
      </Modal.Header>
      <Modal.Body>
        This is an irreversible action, doing so will require you to add a new
        player entry to continue playing.
      </Modal.Body>
      <Modal.Footer>
        <button
          className="btn btn-secondary"
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>
        <button className="btn btn-danger" onClick={handleDelete}>
          Delete
        </button>
      </Modal.Footer>
    </Modal>
  );
};
