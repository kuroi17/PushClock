import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  {
    to: "/",
    label: "Dashboard",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7h18M3 12h18M3 17h18"
        />
      </svg>
    ),
  },
  {
    to: "/add",
    label: "Schedules",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    to: "/activity",
    label: "Activity Timeline",
    icon: (
      <svg
        className="h-4 w-4"
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
    ),
  },
];

const Navbar = ({ title, subtitle, children }) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [topbarQuery, setTopbarQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setShowDropdown(false);
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setTopbarQuery(params.get("q") || "");
  }, [location.search]);

  const updateSearchQuery = (value) => {
    const params = new URLSearchParams(location.search);
    const nextQuery = value.trim();

    if (nextQuery) {
      params.set("q", nextQuery);
    } else {
      params.delete("q");
    }

    const queryString = params.toString();
    navigate({
      pathname: location.pathname,
      search: queryString ? `?${queryString}` : "",
    });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    updateSearchQuery(topbarQuery);
  };

  const handleSearchClear = () => {
    setTopbarQuery("");
    updateSearchQuery("");
  };

  const username = user?.username || "Guest";
  const avatar =
    user?.avatar_url ||
    `https://api.dicebear.com/8.x/notionists/svg?seed=${encodeURIComponent(username)}`;

  return (
    <div className="pc-shell">
      {mobileSidebarOpen && (
        <button
          type="button"
          className="pc-overlay lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside className={`pc-sidebar ${mobileSidebarOpen ? "open" : ""}`}>
        <Link to="/" className="pc-brand" aria-label="PushClock Home">
          <span className="pc-brand-mark">
            <svg
              className="h-5 w-5"
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
          </span>
          <span>
            <span className="pc-brand-title block">PushClock</span>
            <span className="pc-brand-subtitle block">
              Merge scheduler suite
            </span>
          </span>
        </Link>

        <nav className="pc-nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active =
              location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to));

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`pc-nav-link ${active ? "active" : ""}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pc-sidebar-footer">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-textMuted">
            Workspace
          </p>
          <p className="mt-1 text-sm font-semibold text-text">Enterprise</p>
          <p className="text-xs text-textMuted">Git merge orchestration</p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="pc-btn pc-btn-danger w-full"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </button>
      </aside>

      <section className="pc-main">
        <div className="pc-topbar">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              className="pc-icon-btn lg:hidden"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm text-textMuted min-w-[16rem] max-w-[24rem]"
              role="search"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={topbarQuery}
                onChange={(event) => setTopbarQuery(event.target.value)}
                placeholder="Search schedules and activity..."
                className="w-full min-w-0 bg-transparent text-sm text-text outline-none placeholder:text-textMuted"
                aria-label="Search schedules and activity"
              />

              {topbarQuery ? (
                <button
                  type="button"
                  onClick={handleSearchClear}
                  className="pc-icon-btn h-7 w-7"
                  aria-label="Clear search"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  className="pc-icon-btn h-7 w-7"
                  aria-label="Run search"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              )}
            </form>
          </div>

          <div className="flex items-center gap-2">
            {location.pathname !== "/add" && (
              <Link to="/add" className="pc-btn pc-btn-primary">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Schedule
              </Link>
            )}

            {location.pathname !== "/" && (
              <Link
                to="/"
                className="pc-btn pc-btn-secondary hidden sm:inline-flex"
              >
                Overview
              </Link>
            )}

            <button
              type="button"
              className="pc-icon-btn"
              aria-label="Notifications"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.4-1.4A2.03 2.03 0 0118 14.16V11a6 6 0 00-4-5.66V4a2 2 0 10-4 0v1.34A6 6 0 006 11v3.16c0 .54-.21 1.06-.59 1.44L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-2 py-1.5"
                aria-label="Open user menu"
              >
                <img
                  src={avatar}
                  alt={username}
                  className="h-7 w-7 rounded-lg border border-border"
                />
                <span className="hidden md:block text-xs font-semibold text-text max-w-28 truncate">
                  {username}
                </span>
                <svg
                  className={`h-4 w-4 text-textMuted transition-transform ${showDropdown ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showDropdown && (
                <div className="pc-menu">
                  <div className="border-b border-border px-3 py-2">
                    <p className="text-[0.7rem] uppercase tracking-[0.08em] text-textMuted">
                      Signed in as
                    </p>
                    <p className="text-sm font-semibold text-text truncate">
                      {username}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="pc-menu-item danger"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <main className="pc-page animate-enter">
          {(title || subtitle) && (
            <div className="pc-page-header">
              {title && <h1 className="pc-page-title">{title}</h1>}
              {subtitle && <p className="pc-page-subtitle">{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </section>
    </div>
  );
};

export default Navbar;
