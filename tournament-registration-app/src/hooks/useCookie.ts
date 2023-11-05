import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useCookie = (name: string, timeToExpire?: number) => {
  const expiry = timeToExpire ? timeToExpire : 10800;
  const expires = new Date(Date.now() + expiry * 1000).toUTCString();
  const navigate = useNavigate();
  const location = useLocation();

  const getCookie = () => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="));
    return cookie ? cookie.split("=")[1] : null;
  };

  const ignoreRedirectPaths = ["/login", "/register", "/register/"];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cookie, _] = useState(getCookie());

  const setCookie = (value: string) => {
    document.cookie = name + "=" + value + "; expires=" + expires + "; path=/";
  };

  const deleteCookie = () => {
    document.cookie =
      name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  useEffect(() => {
    if (
      getCookie() === null &&
      !ignoreRedirectPaths.includes(location.pathname)
    ) {
      navigate("/login");
    }
  }, []);

  return {
    getCookie,
    setCookie,
    cookie,
    deleteCookie,
  };
};
