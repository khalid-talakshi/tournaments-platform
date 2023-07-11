import { useNavigate } from "react-router-dom";
import { useCookie } from "../../hooks";

export const Navbar = () => {
  const navigate = useNavigate();
  const { getCookie, deleteCookie } = useCookie("token");
  const navItems = (
    <>
      <li className="nav-item">
        <a className="nav-link active" aria-current="page" href="#">
          Home
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="#">
          Link
        </a>
      </li>
      <li className="nav-item dropdown">
        <a
          className="nav-link dropdown-toggle"
          href="#"
          role="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Dropdown
        </a>
        <ul className="dropdown-menu">
          <li>
            <a className="dropdown-item" href="#">
              Action
            </a>
          </li>
          <li>
            <a className="dropdown-item" href="#">
              Another action
            </a>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <a className="dropdown-item" href="#">
              Something else here
            </a>
          </li>
        </ul>
      </li>
      <li className="nav-item">
        <a className="nav-link disabled">Disabled</a>
      </li>
    </>
  );

  const cookie = getCookie();

  const userButtons =
    cookie !== null ? (
      <>
        <button
          className="btn btn-outline-primary me-2"
          onClick={() => deleteCookie()}
        >
          Logout
        </button>
      </>
    ) : (
      <>
        <button
          className="btn btn-outline-primary me-2"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/register")}
        >
          Register
        </button>
      </>
    );

  return (
    <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">
          Gold Cup
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0"></ul>
          <form className="d-flex">{userButtons}</form>
        </div>
      </div>
    </nav>
  );
};
