import React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";

export const UNKNOWN_COMPONENT = "unknown";

/*eslint no-unused-vars: */
export type FallbackRender = (errorData: { error: Error; componentStack: React.ErrorInfo | null; eventId: string | null; message: string | null | undefined; resetError(): void }) => React.ReactNode;

export type ErrorBoundaryProps = {
  message: string | null | undefined;
  children: any;

  fallback?: React.ReactNode | FallbackRender;
  /** Called with the error boundary encounters an error */
  onError?(error: Error, componentStack: React.ErrorInfo, eventId: string): void;
  /** Called on componentDidMount() */
  onMount?(): void;
  /** Called if resetError() is called from the fallback render props function  */
  onReset?(error: Error | null, componentStack: React.ErrorInfo | null, eventId: string | null): void;
  /** Called on componentWillUnmount() */
  onUnmount?(error: Error | null, componentStack: React.ErrorInfo | null, eventId: string | null): void;
};

type ErrorBoundaryState = {
  componentStack: React.ErrorInfo | null;
  error: Error | null;
  eventId: string | null;
};

const INITIAL_STATE = {
  componentStack: null,
  error: null,
  eventId: null,
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = INITIAL_STATE;

  public componentDidCatch(error: Error, componentStack: React.ErrorInfo): void {
    const { onError } = this.props;

    // capture event and generate event id
    const eventId = "";
    if (onError) {
      onError(error, componentStack, eventId);
    }

    // componentDidCatch is used over getDerivedStateFromError
    // so that componentStack is accessible through state.
    this.setState({ error, componentStack, eventId });
  }

  public componentDidMount(): void {
    const { onMount } = this.props;
    if (onMount) {
      onMount();
    }
  }

  public componentWillUnmount(): void {
    const { error, componentStack, eventId } = this.state;
    const { onUnmount } = this.props;
    if (onUnmount) {
      onUnmount(error, componentStack, eventId);
    }
  }

  public resetErrorBoundary: () => void = () => {
    const { onReset } = this.props;
    const { error, componentStack, eventId } = this.state;
    if (onReset) {
      onReset(error, componentStack, eventId);
    }
    this.setState(INITIAL_STATE);
  };

  public render(): React.ReactNode {
    const { fallback } = this.props;
    const { error, componentStack, eventId } = this.state;

    if (error) {
      if (React.isValidElement(fallback)) {
        return fallback;
      }
      if (typeof fallback === "function") {
        return fallback({ error, componentStack, message: this.props.message, resetError: this.resetErrorBoundary, eventId }) as React.ReactNode;
      }

      // Fail gracefully if no fallback provided
      return null;
    }

    return this.props.children;
  }
}

function withErrorBoundary<P extends Record<string, any>>(WrappedComponent: React.ComponentType<P>, errorBoundaryOptions: ErrorBoundaryProps): React.FC<P> {
  const componentDisplayName = WrappedComponent.displayName || WrappedComponent.name || UNKNOWN_COMPONENT;
  const Wrapped: React.FC<P> = (props: P) => (
    <ErrorBoundary {...errorBoundaryOptions}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  Wrapped.displayName = `errorBoundary(${componentDisplayName})`;

  // Copy over static methods from Wrapped component to Profiler HOC
  // See: https://reactjs.org/docs/higher-order-components.html#static-methods-must-be-copied-over
  hoistNonReactStatics(Wrapped, WrappedComponent);
  return Wrapped;
}

export { ErrorBoundary, withErrorBoundary };
