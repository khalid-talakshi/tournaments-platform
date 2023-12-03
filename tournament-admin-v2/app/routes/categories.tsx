import * as Dialog from "@radix-ui/react-dialog";
import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import axios from "axios";
import { useState } from "react";
import { AiFillCloseCircle, AiFillPlusSquare } from "react-icons/ai/index.js";
import { Card, PageTitle } from "~/components";
import { tokenCookie } from "~/cookies.server";

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = await tokenCookie.parse(cookieHeader);
  const categories = await axios.get(`${process.env.API_URL}/categories`, {
    headers: { Authorization: `Bearer ${cookie.token}` },
  });
  return json(categories.data);
};

export default function Index() {
  const loaderData = useLoaderData<any[]>();
  const [showAddModal, setShowAddModal] = useState(false);

  console.log(loaderData);

  return (
    <div className="space-y-4">
      <PageTitle>Categories</PageTitle>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {loaderData.map((category) => {
          return (
            <Card>
              <h2 className="text-xl">{category.name}</h2>
              <p>Code: {category.code}</p>
              <p>Number of Teams: {category.Teams.length}</p>
              <div className="flex space-x-1">
                <button className="bg-blue-900 px-2 py-1 rounded-md hover:bg-blue-950 transition-colors ease-in-out">
                  View
                </button>
                <button className="bg-red-900 px-2 py-1 rounded-md hover:bg-red-950 transition-colors ease-in-out">
                  Delete
                </button>
              </div>
            </Card>
          );
        })}
        <div
          className="border-dashed border-white border-2 rounded-md shadow-lg shadow-slate-950 transition-all ease-in-out duration-500 hover:shadow-xl hover:shadow-slate-950 hover:duration-500 hover:bg-slate-600 flex justify-center items-center hover:cursor-pointer space-x-2 text-2xl"
          onClick={() => setShowAddModal(true)}
        >
          <AiFillPlusSquare />
          <p className="mt-0">Add New</p>
        </div>
      </div>
      <Dialog.Root open={showAddModal} onOpenChange={setShowAddModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50">
            <Dialog.Content className="bg-slate-600 fixed top-[50%] left-[50%] rounded-md translate-x-[-50%] translate-y-[-50%] p-4 shadow-xl shadow-slate-950">
              <Dialog.Title className="flex justify-between items-center text-xl">
                <p>Add New Category</p>
                <Dialog.Close asChild>
                  <AiFillCloseCircle className="hover:fill-red-900 hover:cursor-pointer transition-colors ease-in-out" />
                </Dialog.Close>
              </Dialog.Title>
              <Dialog.Description>
                <form className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        className="bg-slate-700 px-2 py-1 rounded-md"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="code">Code</label>
                      <input
                        type="text"
                        name="code"
                        id="code"
                        className="bg-slate-700 px-2 py-1 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="minAge">Min Age</label>
                      <input
                        type="number"
                        name="minAge"
                        id="minAge"
                        className="bg-slate-700 px-2 py-1 rounded-md"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="maxAge">Max Age</label>
                      <input
                        type="number"
                        name="maxAge"
                        id="maxAge"
                        className="bg-slate-700 px-2 py-1 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="flex flex-row space-x-2 items-center">
                    <input type="checkbox" id="female" name="female"></input>
                    <label htmlFor="female">Female Only</label>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="bg-blue-900 px-2 py-1 rounded-md hover:bg-blue-950 transition-colors ease-in-out w-full"
                    >
                      Submit
                    </button>
                    <Dialog.Close asChild>
                      <button className="bg-red-900 px-2 py-1 rounded-md hover:bg-red-950 transition-colors ease-in-out w-full">
                        Cancel
                      </button>
                    </Dialog.Close>
                  </div>
                </form>
              </Dialog.Description>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
