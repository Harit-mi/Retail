import React from "react";
import { AlertTriangle, RotateCcw, Trash2 } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("DukaanPOS Critical Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetAndReload = () => {
    if (window.confirm("Are you sure? This will clear browser cached state and reload DukaanPOS.")) {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.warn("Could not clear storage:", e);
      }
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center p-6 text-zinc-900 selection:bg-zinc-900 selection:text-white">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-zinc-200 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-950">
                  Dukaan<span className="text-amber-700 font-normal">POS</span> Paused
                </h3>
                <p className="text-xs text-zinc-500">
                  A client-side initialization issue was intercepted
                </p>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono text-zinc-700 overflow-x-auto max-h-36">
              {this.state.error?.message || "Unknown client error"}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reload Register
              </button>
              <button
                type="button"
                onClick={this.handleResetAndReload}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg transition-colors"
                title="Clears corrupted localStorage cache"
              >
                <Trash2 className="w-3.5 h-3.5 text-zinc-500" />
                Reset Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
