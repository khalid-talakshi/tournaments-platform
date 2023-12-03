import { ActionFunction, json } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useOutletContext,
  useRouteError,
} from "@remix-run/react";
import axios from "axios";
import { tokenCookie } from "~/cookies.server";
import { localeFormatter } from "~/utils";

const verificationSteps = [
  {
    id: 1,
    description: "Headshot picture matches ID picture",
    feedback: "Headshot picture does not match ID picture",
  },
  {
    id: 2,
    description: "Name on ID matches name on registration",
    feedback: "Name on ID does not match name on registration",
  },
  {
    id: 3,
    description: "Date of birth on ID matches date of birth on registration",
    feedback:
      "Date of birth on ID does not match date of birth on registration",
  },
  {
    id: 4,
    description: "ID is not expired",
    feedback: "ID is expired",
  },
  { id: 5, description: "Waiver is signed", feedback: "Waiver is not signed" },
  {
    id: 6,
    description: "Waiver is signed by a witness",
    feedback: "Waiver is not signed by a witness",
  },
];

export default function Index() {
  const { verification } = useOutletContext<{ verification: any }>();

  const reasonsList =
    verification.reason !== null ? verification.reason.split(",") : [];

  return (
    <>
      <p className="text-2xl font-bold">Verification</p>
      <div className="flex space-x-2">
        <div className="w-1/3">
          <p className="text-xl">
            <span className="font-bold">Current Status:</span>{" "}
            {verification.status}
          </p>
          <p className="text-xl">
            <span className="font-bold">Last Updated</span>{" "}
            {localeFormatter.format(Date.parse(verification.updatedAt))}
          </p>
          {verification.status === "DENIED" && (
            <p className="text-xl">
              <span className="font-bold">Current Feedback: </span>
              <ul className="list-disc ml-5">
                {reasonsList.map((reason: any) => {
                  return <li>{reason}</li>;
                })}
              </ul>
            </p>
          )}
        </div>
        <div>
          <Form className="space-y-1" method="post">
            <p className="text-xl font-bold">Verification Checklist</p>
            {verificationSteps.map((step) => {
              return (
                <div className="flex space-x-2">
                  <input type="checkbox" name={String(step.id)}></input>
                  <label>{step.description}</label>
                </div>
              );
            })}
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-800 px-2 py-1 rounded transition ease-in-out hover:bg-blue-900"
              >
                Submit
              </button>
              <button
                type="reset"
                className="bg-gray-700 px-2 py-1 transition ease-in-out rounded hover:bg-gray-800"
              >
                Reset
              </button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}

export const action: ActionFunction = async ({ request, params }) => {
  try {
    const body = await request.formData();
    const data = Object.fromEntries(body);

    const ids = Object.keys(data).map((id) => Number(id));

    let reasons = verificationSteps
      .filter((step) => {
        return !ids.includes(step.id);
      })
      .map((step) => {
        return step.feedback;
      });

    let payload = {};

    console.log(reasons);

    if (reasons.length > 0) {
      const reason = reasons.join(",");
      payload = { status: "DENIED", reason };
    } else {
      payload = { status: "VERIFIED" };
    }

    const { token } = await tokenCookie.parse(request.headers.get("Cookie"));

    await axios.put(
      `${process.env.API_URL}/participant/${params.id}/verify`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return null;
  } catch (error: any) {
    console.log(error);
    if (error.response) {
      console.log(error.response);
      return json({ message: error.response.data.message }, { status: 400 });
    }
    return json(
      { message: "We don't know what though. We will investigate" },
      { status: 500 }
    );
  }
};

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
