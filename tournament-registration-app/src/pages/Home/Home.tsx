import { Background } from "../../components";
import "./Home.css";

export const Home = () => {
  return (
    <Background>
      <div className="d-flex justify-content-center align-items-center flex-column center-box">
        <img src="/gc-logo.png" alt="Gold Cup Logo" className="logo" />
        <h1 className="text-light">Gold Cup 2023</h1>
      </div>
    </Background>
  );
};
