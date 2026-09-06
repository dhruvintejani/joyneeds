import { Component, type ReactNode, type ErrorInfo } from "react";
export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    /* Attach a privacy-reviewed error reporter here when available. */
  }
  render() {
    return this.state.failed ? (
      <main className="container empty-state">
        <h1>Something didn’t load correctly</h1>
        <p>
          Your browser may have an older version of this page. Please try again.
        </p>
        <button
          className="button primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
        <a className="button secondary" href="/">
          Back to Home
        </a>
      </main>
    ) : (
      this.props.children
    );
  }
}
