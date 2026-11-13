import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, HardDrive } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erreur interceptée par ErrorBoundary OASIS:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('oasis_hydro_suite_active_project');
    } catch (e) {
      console.warn('Erreur purge local storage:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-['Inter',sans-serif]">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-xl w-full p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-xl font-bold font-['Montserrat'] tracking-wide">
                OASIS HYDRO SUITE — Récupération Système
              </h1>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Une exception d'affichage a été interceptée par le gestionnaire de sécurité. Aucun
                calcul physique ni donnée en base n'ont été corrompus.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950 p-4 rounded-xl text-left border border-slate-800 text-[11px] font-mono text-rose-300 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 bg-[#0E4A7B] hover:bg-[#00A3E0] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recharger la page</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all border border-slate-600"
              >
                <HardDrive className="w-4 h-4" />
                <span>Réinitialiser le cache local</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
