import * as Navbar from "@radix-ui/react-navigation-menu";
import {
  AiFillHome,
  AiFillIdcard,
  AiOutlineTeam,
} from "react-icons/ai/index.js";
import { Link, useLocation } from "@remix-run/react";
import logo from "~/assets/gc-logo.png";

export const NavSidebar = () => {
  const navbarItems = [
    {
      text: "Dashboard",
      icon: <AiFillHome />,
      to: "/dashboard",
    },
    {
      text: "Participants",
      icon: <AiOutlineTeam />,
      to: "/participants",
    },
    {
      text: "Categories",
      icon: <AiFillIdcard />,
      to: "/categories",
    },
  ];

  const location = useLocation();

  return (
    <div>
      <div className="flex items-center text-2xl font-semibold space-x-2 py-2 px-2">
        <img src={logo} alt="gc-logo" className="w-10" />
        <p>Gold Cup</p>
      </div>
      <Navbar.Root>
        <Navbar.List className="flex flex-col space-y-1">
          {navbarItems.map((item) => {
            return (
              <Navbar.Item
                className={`rounded text-lg py-1 px-2 space-x-2 transition-colors ease-in-out hover:bg-slate-600 hover:cursor-pointer ${
                  location.pathname == item.to ? "bg-slate-600" : "bg-slate-700"
                } `}
              >
                <Link to={item.to}>
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <p>{item.text}</p>
                  </div>
                </Link>
              </Navbar.Item>
            );
          })}
        </Navbar.List>
      </Navbar.Root>
    </div>
  );
};
