import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import axios from "axios";
import { tokenCookie } from "~/cookies.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const { key } = params;

  const cookie = await tokenCookie.parse(request.headers.get("Cookie"));

  const { data } = await axios.get(`${process.env.API_URL}/image/${key}`, {
    headers: { Authorization: `Bearer ${cookie.token}` },
  });
  return json(data);
};

export default function Index() {
  const { key } = useParams();
  const data = useLoaderData<any>();

  const getType = () => {
    return key?.split(".")[1];
  };

  return (
    <div className="flex justify-center items-center h-full">
      {getType() === "pdf" ? (
        <object data={data} type="application/pdf" width={700} height={900}>
          <embed src={data} type="application/pdf" />
        </object>
      ) : (
        <img src={data} alt={key} className="w-1/3" />
      )}
    </div>
  );
}
