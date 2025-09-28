import React from "react";

type ErrorBoundaryState = { hasError: boolean; message: string };

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    // Error caught and handled
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-xl w-full">
            <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-800">
              <h2 className="font-semibold mb-2">Something went wrong</h2>
              <p className="text-sm break-words">{this.state.message}</p>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}
