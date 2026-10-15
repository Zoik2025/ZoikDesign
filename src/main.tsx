import { Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message || 'Error inesperado' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Capturado en ErrorBoundary de Zoik Design:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-[#111114] text-white flex flex-col items-center justify-center p-6 select-none font-sans">
          <div className="bg-[#1b1b20] border border-[#2e2e38] rounded-xl p-8 max-w-md w-full text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto text-xl font-black">
              !
            </div>
            <h2 className="text-base font-bold">Recuperación de Estado</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Una herramienta generó un estado inesperado. La pantalla se ha protegido automáticamente contra bloqueos.
            </p>
            <div className="p-2.5 bg-[#0e0e11] rounded border border-[#272730] text-[10px] text-zinc-500 font-mono break-all text-left">
              {this.state.errorMessage}
            </div>
            <button
              onClick={this.handleReload}
              className="w-full py-2.5 rounded-lg bg-[#0d66d0] hover:bg-[#1070e5] text-white font-bold text-xs transition shadow-md"
            >
              Reanudar Mesa de Trabajo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
