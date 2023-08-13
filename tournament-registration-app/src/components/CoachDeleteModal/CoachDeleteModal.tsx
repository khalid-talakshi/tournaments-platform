import { Modal } from "react-bootstrap";
import { Coach, Player } from "../../types";

export interface Props {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  handleDelete: () => void;
  coach: Coach;
}

export const CoachDeleteModal = ({
  showModal,
  setShowModal,
  handleDelete,
  coach,
}: Props) => {
  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        Delete Player {coach.Participant?.name}
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
