import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
          <h1 style={{ color: 'red', fontSize: '1.5rem' }}>Something went wrong</h1>
          <pre style={{ marginTop: '1rem', whiteSpace: 'pre-wrap', color: '#333' }}>
            {this.state.error?.message}
          </pre>
          <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', color: '#888', fontSize: '0.8rem' }}>
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
