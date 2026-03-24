import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.warn('ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.warn('ErrorBoundary componentDidCatch:', error, errorInfo);
    
    // CRITICAL: Don't let DOM errors crash the entire game
    if (error.message.includes('insertBefore') || 
        error.message.includes('removeChild') || 
        error.message.includes('Node')) {
      console.log('DOM manipulation error caught and contained - game continues');
    }
  }

  render() {
    if (this.state.hasError) {
      // Return the fallback or null to prevent crash
      return this.props.fallback || null;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;