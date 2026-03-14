import React from "react";
import { Link, useLocation } from "react-router-dom";

const Header = ({ title, subtitle }) => {
  const location = useLocation();
  const isDashboard = location.pathname === "/";
  const isAddSchedule = location.pathname === "/add";

  return (
    <header className="pc-page-header mb-6">
      {!isDashboard && !isAddSchedule && (
        <div className="mb-4 flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to overview
          </Link>
        </div>
      )}
      <h1 className="pc-page-title">{title}</h1>
      <p className="pc-page-subtitle">{subtitle}</p>
    </header>
  );
};

export default Header;
