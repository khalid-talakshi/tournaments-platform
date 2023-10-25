import {
  isRouteErrorResponse,
  useOutletContext,
  useRouteError,
} from "@remix-run/react";

export default function Index() {
  const { verification } = useOutletContext<{ verification: any }>();
  console.log("test");
  return (
    <>
      <p className="text-2xl font-bold">Verification</p>
      <p className="text-xl">
        <span className="font-bold">Current Status:</span> {verification.status}
      </p>
    </>
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
