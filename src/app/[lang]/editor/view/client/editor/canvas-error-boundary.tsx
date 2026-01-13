"use client";

import { Component, ReactNode } from "react";
import { Button } from "@/app/components/ui/button";

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary specifically for canvas initialization failures.
 * Provides recovery options for canvas-related errors.
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Canvas error boundary caught an error:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h2 className="mb-4 text-xl font-semibold">Canvas Error</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {this.state.error?.message ||
                "Failed to initialize canvas. This may be due to invalid project data or browser compatibility issues."}
            </p>
            <Button onClick={this.handleReset} variant="default">
              Retry
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

