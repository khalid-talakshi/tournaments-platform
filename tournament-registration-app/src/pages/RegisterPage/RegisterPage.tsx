import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { register } from "../../api";
import { useCookie } from "../../hooks";
import { isUserError } from "../../types";

export const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { setCookie, cookie } = useCookie("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (cookie) {
      navigate("/dashboard");
    }
  }, [cookie, navigate]);

  useEffect(() => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
    } else {
      setError(null);
    }
  }, [confirmPassword]);

  const registerMutation = useMutation(
    async () => {
      return await register(username, password);
    },
    {
      onSuccess: (data, variables, context) => {
        if (isUserError(data)) {
          setError(data.message);
        } else {
          setCookie(data.token);
          navigate("/dashboard");
        }
      },
    }
  );

  const handleRegister = () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
    } else {
      registerMutation.mutate();
    }
  };

  return (
    <div
      className="d-flex justify-content-center flex-column"
      style={{
        height: "94vh",
      }}
    >
      <div className="loginBox align-self-center">
        <Alert
          variant="danger"
          onClose={() => setError(null)}
          dismissible
          show={error !== null}
        >
          {error}
        </Alert>
        <h1>Register</h1>
        <div className="mb-3">
          <label htmlFor="exampleFormControlInput1" className="form-label">
            Username
          </label>
          <input
            type="email"
            className="form-control"
            id="exampleFormControlInput1"
            placeholder="name@example.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleFormControlTextarea1" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="exampleFormControlInput1"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleFormControlTextarea1" className="form-label">
            Confirm Password
          </label>
          <input
            type="password"
            className="form-control"
            id="exampleFormControlInput1"
            placeholder="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={handleRegister}
          disabled={registerMutation.isLoading}
        >
          {registerMutation.isLoading && (
            <span
              className="spinner-grow spinner-grow-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
          )}
          Login
        </button>
      </div>
    </div>
  );
};
