import React from "react";
import { Link, useLocation } from "react-router-dom";

const Header = ({ title, subtitle }) => {
  const location = useLocation();
  const isDashboard = location.pathname === "/";
  const isAddSchedule = location.pathname === "/add";

  return (
    <header className="mb-8">
      {!isDashboard && !isAddSchedule && (
        <div className="flex items-center mb-4">
          <Link
            to="/"
            className="text-primary hover:text-primary-dark flex items-center transition-colors"
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
            Back to Dashboard
          </Link>
        </div>
      )}
      <h1 className="text-3xl md:text-4xl font-bold text-text mb-2 leading-tight">
        {title}
      </h1>
      <p className="text-textMuted text-base md:text-lg">{subtitle}</p>
    </header>
  );
};

export default Header;
