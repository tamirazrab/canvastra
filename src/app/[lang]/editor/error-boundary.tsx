"use client";

import { Component, ReactNode } from "react";
import { Button } from "@/app/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for editor route.
 * Catches errors in editor components and displays user-friendly error message.
 */
export class EditorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error for monitoring
    console.error("Editor error boundary caught an error:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/editor";
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-screen flex-col items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h1 className="mb-4 text-2xl font-bold">Something went wrong</h1>
            <p className="mb-6 text-muted-foreground">
              {this.state.error?.message ||
                "An unexpected error occurred in the editor. Please try again."}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={this.handleReset} variant="default">
                Go to Editor
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

