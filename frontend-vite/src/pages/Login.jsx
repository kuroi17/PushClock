import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const Login = () => {
  const { login, authenticated, loading } = useAuth();

  // If already authenticated, redirect to dashboard
  if (authenticated) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="pc-surface p-6 text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="mt-3 text-sm text-textMuted">Preparing workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 md:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-6rem] top-[-6rem] h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-[-7rem] right-[-4rem] h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.9fr]">
        <section className="pc-surface hidden p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              SaaS Merge Orchestration
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-text">
              Ship merges with confidence, not guesswork.
            </h1>
            <p className="mt-3 max-w-xl text-sm text-textMuted">
              PushClock combines scheduling, merge preview, and rollback
              visibility in one operational dashboard built for engineering
              teams.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: "Preview-first merges", value: "100%" },
              { label: "Rollback traceability", value: "Real-time" },
              { label: "Branch sync visibility", value: "Live" },
            ].map((item) => (
              <article
                key={item.label}
                className="rounded-xl border border-border bg-bg px-4 py-3"
              >
                <p className="text-2xl font-bold text-text">{item.value}</p>
                <p className="mt-1 text-xs text-textMuted">{item.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="pc-surface p-7 md:p-9">
          <div className="mx-auto max-w-md">
            <div className="flex items-center gap-3">
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
              <div>
                <p className="text-lg font-bold text-text">PushClock</p>
                <p className="text-xs text-textMuted">Enterprise Merge Suite</p>
              </div>
            </div>

            <h2 className="mt-6 text-3xl font-bold text-text">Welcome back</h2>
            <p className="mt-2 text-sm text-textMuted">
              Sign in with GitHub to manage schedules, preview changes, and
              control rollback.
            </p>

            <button
              type="button"
              onClick={login}
              className="pc-btn pc-btn-primary mt-6 w-full justify-center py-3 text-sm"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>

            <div className="mt-7 rounded-xl border border-border bg-bg p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-textMuted">
                What you can do
              </p>
              <ul className="mt-3 space-y-2 text-sm text-text">
                <li>Preview merges before they run</li>
                <li>Schedule branch operations with timestamps</li>
                <li>Rollback tracked merges from dashboard cards</li>
              </ul>
            </div>

            <p className="mt-5 text-xs text-textMuted">
              By signing in, you allow PushClock to access your GitHub
              repositories for scheduling and merge automation.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
