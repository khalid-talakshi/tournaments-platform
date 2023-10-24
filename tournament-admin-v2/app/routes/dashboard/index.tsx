import { LoaderFunction, type MetaFunction, json } from "@remix-run/node";
import { Card, PageTitle } from "~/components";
import { verifyCookie } from "~/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const resFunction = await verifyCookie(request);
  if (resFunction) return resFunction;
  return json({});
};

export default function Index() {
  return (
    <div className="space-y-2">
      <PageTitle>Dashbaord</PageTitle>
      <div className="w-1/3">
        <Card>
          <p className="text-xl font-bold">Current Number of Participants</p>
          <div className="flex justify-between flex-col">
            <div className="flex justify-between">
              <p>Verified</p>
              <p>5</p>
            </div>
            <div className="flex justify-between">
              <p>Pending</p>
              <p>20</p>
            </div>
            <div className="flex justify-between">
              <p>Denied</p>
              <p>15</p>
            </div>
            <div className="flex justify-between font-bold mt-1">
              <p>Total</p>
              <p>40</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
