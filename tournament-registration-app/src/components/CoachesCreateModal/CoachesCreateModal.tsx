import { useMutation, useQuery } from "@tanstack/react-query";
import { Modal } from "react-bootstrap";
import { createCoach, createPlayer, getParticipants } from "../../api";
import { useCookie } from "../../hooks";
import { CoachPayload, Participant, PlayerPayload } from "../../types";
import { useReducer } from "react";

export interface Props {
  show: boolean;
  onHide: () => void;
}

const reducer: (
  state: CoachPayload,
  action: { type: string; value: any }
) => CoachPayload = (state, action) => {
  console.log(action);
  switch (action.type) {
    case "participantId":
      const newState = { ...state, participantId: action.value };
      console.log(newState);
      return newState;
    case "teamId":
      return { ...state, teamId: action.value };
    case "password":
      return { ...state, password: action.value };
    case "certification":
      return { ...state, certification: action.value };
    default:
      return state;
  }
};

export const CoachesCreateModal = ({ show, onHide }: Props) => {
  const { getCookie } = useCookie("token");
  const { data } = useQuery(
    ["participants", getCookie() || ""],
    getParticipants
  );
  const [state, dispatch] = useReducer(reducer, {
    participantId: 0,
    teamId: 0,
    password: "",
    certification: "",
  });

  const handleCreate = () => {
    console.log(state);
    // validate data
    if (state.teamId < 0 || state.teamId > 99) {
      alert("Team ID must be between 0 and 99");
      return;
    }

    if (state.participantId === 0) {
      alert("Please select a participant");
      return;
    }

    coachCreateMutation.mutate(state);
  };

  const coachCreateMutation = useMutation(
    ["createPlayer"],
    (data: CoachPayload) => createCoach(getCookie() || "", data),
    {
      onSuccess: (data) => {
        onHide();
      },
    }
  );

  return (
    <Modal show={show}>
      <Modal.Header closeButton onHide={onHide}>
        <Modal.Title>Create Coach</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-between align-items-center">
          <label htmlFor="participant" style={{ paddingRight: "1em" }}>
            Participant
          </label>
          <select
            className="form-control"
            onChange={(e) => {
              dispatch({
                type: "participantId",
                value: parseInt(e.target.value),
              });
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
              dispatch({ type: "teamId", value: parseInt(e.target.value) })
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
          <label htmlFor="certification" style={{ paddingRight: "1em" }}>
            Certification
          </label>
          <input
            type="number"
            min={0}
            max={99}
            className="form-control"
            onChange={(e) =>
              dispatch({ type: "certification", value: e.target.value })
            }
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onHide}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            console.log("hit button");
            handleCreate();
          }}
        >
          Create
        </button>
      </Modal.Footer>
    </Modal>
  );
};
