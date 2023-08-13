import { useMutation, useQuery } from "@tanstack/react-query";
import { Modal } from "react-bootstrap";
import { createPlayer, getParticipants } from "../../api";
import { useCookie } from "../../hooks";
import { Participant, PlayerPayload } from "../../types";
import { useReducer } from "react";

export interface Props {
  show: boolean;
  onHide: () => void;
}

const reducer: (
  state: PlayerPayload,
  action: { type: string; value: any }
) => PlayerPayload = (state, action) => {
  switch (action.type) {
    case "participantId":
      const newState = { ...state, participantId: action.value };
      console.log(newState);
      return newState;
    case "teamId":
      return { ...state, teamId: action.value };
    case "password":
      return { ...state, password: action.value };
    case "jerseyNumber":
      return { ...state, jerseyNumber: action.value };
    default:
      return state;
  }
};

export const PlayerCreateModal = ({ show, onHide }: Props) => {
  const { getCookie } = useCookie("token");
  const { data } = useQuery(
    ["participants", getCookie() || ""],
    getParticipants
  );
  const [state, dispatch] = useReducer(reducer, {
    participantId: 0,
    teamId: 0,
    password: "",
    jerseyNumber: 0,
  });

  const handleCreate = () => {
    // validate data
    if (state.teamId < 0 || state.teamId > 99) {
      alert("Team ID must be between 0 and 99");
      return;
    }
    if (state.jerseyNumber < 0 || state.jerseyNumber > 99) {
      alert("Jersey Number must be between 0 and 99");
      return;
    }

    if (state.participantId === 0) {
      alert("Please select a participant");
      return;
    }

    playerCreateMutation.mutate(state);
  };

  const playerCreateMutation = useMutation(
    ["createPlayer"],
    (data: PlayerPayload) => createPlayer(getCookie() || "", data),
    {
      onSuccess: (data) => {
        onHide();
      },
    }
  );

  return (
    <Modal show={show}>
      <Modal.Header closeButton onHide={onHide}>
        <Modal.Title>Create Player</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-between align-items-center">
          <label htmlFor="participant" style={{ paddingRight: "1em" }}>
            Participant
          </label>
          <select
            className="form-control"
            onChange={(e) => {
              dispatch({ type: "participantId", value: e.target.value });
            }}
            defaultValue={0}
          >
            <option value={0}>Please Select...</option>
            {data &&
              Array.isArray(data) &&
              data.map((participant: Participant) => (
                <option key={participant.id} value={participant.id}>
                  {participant.name}
                </option>
              ))}
          </select>
        </div>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <label htmlFor="teamId" style={{ paddingRight: "1em" }}>
            Team ID
          </label>
          <input
            type="number"
            className="form-control"
            onChange={(e) =>
              dispatch({ type: "teamId", value: e.target.value })
            }
          />
        </div>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <label htmlFor="password" style={{ paddingRight: "1em" }}>
            Password
          </label>
          <input
            type="password"
            className="form-control"
            onChange={(e) => {
              dispatch({ type: "password", value: e.target.value });
            }}
          />
        </div>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <label htmlFor="jerseyNumber" style={{ paddingRight: "1em" }}>
            Jersey Number
          </label>
          <input
            type="number"
            min={0}
            max={99}
            className="form-control"
            onChange={(e) =>
              dispatch({ type: "jerseyNumber", value: e.target.value })
            }
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onHide}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={() => handleCreate()}>
          Create
        </button>
      </Modal.Footer>
    </Modal>
  );
};
