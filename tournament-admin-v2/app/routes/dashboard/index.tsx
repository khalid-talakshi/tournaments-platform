import type { MetaFunction } from "@remix-run/node";
import { Card, PageTitle } from "~/components";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
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
