import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../api";
import { isUserError } from "../../types";
import { Alert } from "react-bootstrap";
import { useCookie } from "../../hooks";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import * as jwt from "jose";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { setCookie, cookie } = useCookie("adminToken");
  const navigate = useNavigate();

  useEffect(() => {
    if (cookie) {
      navigate("/dashboard");
    }
  }, [cookie, navigate]);

  const loginMutation = useMutation(
    async () => {
      return await login(username, password);
    },
    {
      onSuccess: async (data) => {
        if (isUserError(data)) {
          setError(data.message);
        } else {
          const checksum = data.checksum;
          const verify = (await jwt.jwtVerify(
            checksum,
            import.meta.env.VITE_API_SHARED_SECRET
          )) as any;
          if (verify.username !== username) {
            setError("Invalid token");
            return;
          }
          setCookie(data.token);
          navigate("/dashboard");
        }
      },
    }
  );

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
        <h1>Login</h1>
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
        <button
          className="btn btn-primary"
          onClick={() => loginMutation.mutate()}
          disabled={loginMutation.isLoading}
        >
          {loginMutation.isLoading && (
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
