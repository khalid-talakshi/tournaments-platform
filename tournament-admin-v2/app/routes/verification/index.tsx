import type { MetaFunction } from "@remix-run/node";
import { PageTitle } from "~/components";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const sampleRows = [
    { id: 1, name: "John Doe", status: "Verified", date: "June 1, 2021" },
    { id: 2, name: "Jane Doe", status: "Pending", date: "June 1, 2021" },
    { id: 3, name: "John Smith", status: "Denied", date: "June 1, 2021" },
  ];

  return (
    <div className="space-y-2">
      <PageTitle>Verification</PageTitle>
      <div className="w-4/5 mx-auto rounded-lg overflow-hidden border-slate-500 border shadow-lg shadow-slate-950">
        <table className=" w-full">
          <thead className="bg-slate-800 text-left">
            <tr>
              <th className="w-2/3 py-2 px-2">Name</th>
              <th>Verification Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {sampleRows.map((row) => {
              return (
                <tr className="odd:bg-slate-700">
                  <td className="px-2 py-2">{row.name}</td>
                  <td>{row.status}</td>
                  <td>{row.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
