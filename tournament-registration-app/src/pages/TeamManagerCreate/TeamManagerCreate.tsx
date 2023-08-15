import { useNavigate } from "react-router-dom";
import { TeamManagerForm } from "../../components";

export const TeamManagerCreate = () => {
  const navigate = useNavigate();
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
      <h1>Create Team Manager</h1>
      <TeamManagerForm />
    </div>
  );
};
