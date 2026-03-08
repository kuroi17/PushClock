import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className="text-2xl font-bold">PushPilot</h1>
          </Link>
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="hover:text-blue-200 transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link
              to="/add"
              className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium"
            >
              + Schedule Push
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
