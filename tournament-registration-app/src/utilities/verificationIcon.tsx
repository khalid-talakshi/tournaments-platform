import { Participant } from "../types";

export const verificationIcon = (participant: Participant) => {
  if (participant.Verification?.status === "APPROVED") {
    return <i className="bi bi-check-circle text-success me-1"></i>;
  } else if (participant.Verification?.status === "REJECTED") {
    return <i className="bi bi-x-circle text-danger me-1"></i>;
  } else {
    return <i className="bi bi-question-circle text-warning me-1"></i>;
  }
};
