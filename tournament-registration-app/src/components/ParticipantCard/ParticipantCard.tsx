import { useCookie } from "../../hooks";
import { Participant } from "../../types";
import { S3Image } from "../S3Image";

export interface Props {
  participant: Participant;
}

export const ParticipantCard = ({ participant }: Props) => {
  const { getCookie } = useCookie("token");

  const friendlyDate = (dateStr: string) => {
    if (dateStr === "") {
      return "";
    }
    const date = Date.parse(dateStr);
    return new Date(date).toISOString().split("T")[0];
  };

  const friendlyTime = (dateStr: string) => {
    if (dateStr === "") {
      return "";
    }
    const date = Date.parse(dateStr);
    return new Date(date).toISOString().split("T")[1].split(".")[0];
  };

  return (
    <div className="card">
      <S3Image
        imageKey={participant.headshotKey}
        token={getCookie() || ""}
        cardImage
      />
      <div className="card-body">
        <h5 className="card-title">{participant.name}</h5>
        <p className="card-text">
          Date of Birth: {friendlyDate(participant.dob)}
        </p>
        <p className="card-text">
          Verification Status:{" "}
          <i
            className="bi bi-check-circle"
            style={{ color: "yellow", paddingRight: "1%" }}
          ></i>
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
        <div className="d-flex flex-row">
          <button className="btn btn-primary me-1">Edit</button>
          <button className="btn btn-danger">Delete</button>
        </div>
      </div>
    </div>
  );
};
