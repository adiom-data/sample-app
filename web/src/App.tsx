import { useEffect, useState } from "react";
import { AuthTokenManager } from "@adiom-data/framework-web/auth";
import { createSampleClient } from "./api/sampleClient";
import type { GetSessionResponse, User } from "./gen/sample/v1/sample_pb";

type State =
  | { kind: "loading" }
  | { kind: "anonymous" }
  | { kind: "authenticated"; session: GetSessionResponse }
  | { kind: "error"; message: string };

const authTokenManager = new AuthTokenManager();
const sampleClient = createSampleClient(authTokenManager);

export default function App() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setState({ kind: "loading" });
    const token = await authTokenManager.getToken();
    if (!token) {
      setState({ kind: "anonymous" });
      return;
    }
    try {
      const session = await sampleClient.getSession({});
      setState({ kind: "authenticated", session });
    } catch (error) {
      setState({ kind: "error", message: errorMessage(error) });
    }
  }

  async function logout() {
    await authTokenManager.logout();
    setState({ kind: "anonymous" });
  }

  const user = state.kind === "authenticated" ? state.session.user : undefined;

  return (
    <main className="shell">
      <section className="panel" aria-live="polite">
        <div className="mast">
          <p className="eyebrow">Bazel + Go + React</p>
          <h1>Sample App</h1>
        </div>

        {state.kind === "loading" && <p className="muted">Checking session...</p>}

        {state.kind === "anonymous" && (
          <div className="stack">
            <p className="lead">Sign in to mint an app token and call the protected API through the gateway.</p>
            <a className="button primary" href="/auth/login">
              Login
            </a>
          </div>
        )}

        {state.kind === "authenticated" && (
          <div className="stack">
            <div className="user">
              <div className="avatar">{initials(user)}</div>
              <div>
                <p className="name">{user?.name || user?.email || user?.id}</p>
                <p className="muted">{user?.email || user?.id}</p>
              </div>
            </div>
            <dl className="facts">
              <div>
                <dt>User ID</dt>
                <dd>{user?.id}</dd>
              </div>
              <div>
                <dt>Scopes</dt>
                <dd>{user?.scopes?.join(", ") || "none"}</dd>
              </div>
              <div>
                <dt>Postgres</dt>
                <dd>{state.session.database?.enabled ? state.session.database.error || "connected" : "disabled"}</dd>
              </div>
            </dl>
            <div className="actions">
              <button className="button" onClick={refresh}>
                Refresh
              </button>
              <button className="button danger" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        )}

        {state.kind === "error" && (
          <div className="stack">
            <p className="error">{state.message}</p>
            <button className="button" onClick={refresh}>
              Try again
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function initials(user?: User): string {
  const source = user?.name || user?.email || "?";
  return source
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}
