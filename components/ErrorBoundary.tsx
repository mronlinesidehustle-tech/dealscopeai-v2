import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen font-sans flex flex-col items-center justify-center p-8 bg-slate-50 text-slate-800">
          <div className="max-w-2xl text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-slate-600 mb-6">
              The application encountered an error. Please check the console for more details.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800 text-left">
              <p className="font-semibold mb-2">Error Details:</p>
              <pre className="whitespace-pre-wrap break-words">
                {this.state.error?.toString()}
              </pre>
              {this.state.errorInfo && (
                <>
                  <p className="font-semibold mt-4 mb-2">Component Stack:</p>
                  <pre className="whitespace-pre-wrap break-words text-xs">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}