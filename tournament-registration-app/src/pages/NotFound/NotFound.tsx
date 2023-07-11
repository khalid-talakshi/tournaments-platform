import { useNavigate } from "react-router-dom";
import { Background } from "../../components";
import "./NotFound.css";

export const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Background>
      <div className="d-flex justify-content-center align-items-center flex-column center-box">
        <h1 className="text-light">Page Not Found</h1>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Go Home
        </button>
      </div>
    </Background>
  );
};
