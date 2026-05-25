import React from "react";
import { assets, dummyUserData } from "../assets/assets";
import { useNavigate, Link } from "react-router-dom";
import MenuItems from "./MenuItems";
import { CirclePlus } from "lucide-react";
import { useClerk, UserButton } from "@clerk/clerk-react";
import { useSelector } from "react-redux";

const SideBar = ({ sideBarOpen, setSideBarOpen }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.value);
  const { signOut } = useClerk();

  return (
    <div
      className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between absolute sm:relative left-0 top-0 bottom-0 z-20
        transition-all duration-300 ease-in-out
        ${sideBarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}`}
    >
      {/* Top: Logo */}
      <div className="w-full">
        <Link
          to="/"
          className="flex items-center gap-1 px-4 py-4 w-full hover:bg-gray-50 transition-colors duration-200"
        >
          <img
            src={assets.logo}
            className="w-12 h-12 cursor-pointer"
            alt="Amorzinho logo"
          />
          <span className="text-lg font-semibold text-gray-800">
            Amorzinho
          </span>
        </Link>
        <hr className="border-gray-200" />
      </div>

      {/* Middle: Menu + Create Post */}
      <div className="flex-1 overflow-auto py-4">
        <div className="px-4">
          <MenuItems setSideBarOpen={setSideBarOpen} />
        </div>

        {/* Create Post Button */}
        <div className="px-4 mt-4">
          <Link
            to="/createpost"
            className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 
                       hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98] 
                       text-white font-medium w-full justify-start transition-all duration-200"
          >
            <CirclePlus className="w-5 h-5" />
            <span>Create Post</span>
          </Link>
        </div>
      </div>

      {/* Bottom: Profile */}
      <div className="w-full border-t border-gray-200 px-4 py-4">
        <button className="w-full flex items-center gap-3 rounded-lg hover:bg-gray-50 p-2 transition-all">
          <UserButton />
          <div className="text-left">
            <h1 className="text-sm font-medium text-gray-800">
              {user.full_name}
            </h1>
            <p className="text-xs text-gray-500">@{user.username}</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SideBar;
