import { useNavigate } from "react-router-dom";
import { TeamForm } from "../../components";
import { Alert } from "react-bootstrap";
import { useState } from "react";

export const TeamCreate = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
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
      <Alert variant="danger" show={Boolean(error)}>
        <p className="mb-0">{error}</p>
      </Alert>
      <h1>Create Team</h1>
      <TeamForm setError={setError} />
    </div>
  );
};
