import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from '../ui/Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // In production, error telemetry can be dispatched to Sentry/Datadog
    if (import.meta.env.DEV) {
      console.error('Unhandled UI rendering error in ErrorBoundary:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface-canvas flex items-center justify-center p-6 text-neutral-800">
          <div className="max-w-lg w-full bg-white rounded-xl shadow-lg border border-neutral-200 p-8 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-5">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h1 className="font-serif text-2xl font-bold text-neutral-900 tracking-tight">
              Application Notice
            </h1>
            <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
              We encountered an unexpected display anomaly while processing this page.
              Please refresh your session or return to our trade catalogue.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mt-4 p-3 bg-neutral-900 text-red-400 font-mono text-[11px] text-left rounded overflow-x-auto max-h-36">
                {this.state.error.toString()}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={this.handleReload}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReset}
                className="flex items-center gap-2"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
