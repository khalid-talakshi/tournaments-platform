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
      <div className="w-1/2">
        <Card>
          <p className="text-xl font-bold">Current Number of Participants</p>
          <p>5 Verified</p>
          <p>20 Pending</p>
          <p>15 Denied</p>
          <p>40 Total</p>
        </Card>
      </div>
    </div>
  );
}
