import { useNavigate, useParams } from "react-router-dom";
import { ParticipantForm } from "../../components";
import { useCookie } from "../../hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getParticipant } from "../../api";
import { Participant } from "../../types";

export const ParticipantEdit = () => {
  const navigate = useNavigate();
  const { cookie } = useCookie("token");
  const queryClient = useQueryClient();
  const { id } = useParams();
  const { data, isLoading, error } = useQuery(
    ["participant", cookie, id],
    getParticipant
  );
  return (
    <div className="container">
      <a
        className="icon-link my-2 icon-link-hover"
        style={{ cursor: "pointer", textDecoration: "none" }}
        onClick={() => {
          navigate(-1);
        }}
      >
        <i className="bi-arrow-left me-1"></i>Back
      </a>
      <h1>Edit Participant</h1>
      <ParticipantForm participant={data as Participant} />
    </div>
  );
};
