import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Database } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ProfileErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Profile Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 pt-4 pb-24 px-4">
          <div className="max-w-2xl mx-auto">
            {/* Error Header */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="text-red-600" size={24} />
                <h1 className="text-xl font-bold text-red-800">Profile Error</h1>
              </div>
              <p className="text-red-700 mb-4">
                There was an error loading your profile. This is likely due to missing database tables or connection issues.
              </p>
            </div>

            {/* Database Setup Instructions */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="text-blue-600" size={24} />
                <h2 className="text-lg font-semibold">Quick Fix</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">1. Run Database Setup</h3>
                  <p className="text-blue-800 text-sm mb-3">
                    Copy and run the SQL from <code className="bg-blue-100 px-2 py-1 rounded">FIX_MISSING_TABLES.sql</code> in your Supabase SQL Editor.
                  </p>
                  <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                    -- Go to Supabase Dashboard → SQL Editor → New Query<br/>
                    -- Copy the entire FIX_MISSING_TABLES.sql file content<br/>
                    -- Paste and run it
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">2. Test Again</h3>
                  <p className="text-green-800 text-sm">
                    After running the SQL, click "Retry" below to test the profile again.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={this.handleRetry}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <RefreshCw size={16} />
                Retry
              </button>
              <button
                onClick={this.handleRefresh}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Refresh Page
              </button>
            </div>

            {/* Error Details (Collapsible) */}
            {this.state.error && (
              <details className="mt-6 bg-gray-50 rounded-lg p-4">
                <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                  Error Details (Click to expand)
                </summary>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Error:</strong>
                    <pre className="mt-1 text-red-600 bg-red-50 p-2 rounded overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 text-gray-600 bg-gray-100 p-2 rounded overflow-auto text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
