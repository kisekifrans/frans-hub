"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional override of the default fallback UI. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Useful label for the error card (e.g. "Setup tab"). */
  label?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Small, dependency-free error boundary used to isolate a single dashboard
 * tab so a crash inside it doesn't take down the whole page (and trigger the
 * browser's native "couldn't load" overlay).
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    if (error instanceof Error) return { error };
    if (typeof error === "string") return { error: new Error(error) };
    return { error: new Error("Unexpected error.") };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    // Always log — production minified errors often have an empty `.message`.
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset);
    }

    return (
      <div className="glass-card space-y-3 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              {this.props.label
                ? `${this.props.label} couldn't load`
                : "Something went wrong"}
            </h3>
            <p className="mt-1 break-words text-xs text-zinc-500 dark:text-zinc-400">
              {error.message ||
                (typeof error.name === "string" && error.name !== "Error"
                  ? error.name
                  : "Unexpected error.")}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={this.reset}
          className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    );
  }
}
