import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { AiOutlineTeam } from "react-icons/ai/index.js";

export default function Index() {
  return (
    <div className="w-full flex flex-col justify-center items-center text-xl border-dashed border-white border-2 rounded py-5">
      <div className="text-7xl">
        <AiOutlineTeam />
      </div>
      The Teams Page is coming soon!
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
