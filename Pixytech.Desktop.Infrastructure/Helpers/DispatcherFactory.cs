using System;
using System.Windows;
using System.Windows.Threading;

namespace Pixytech.Desktop.Presentation.Infrastructure.Helpers
{
    internal class DispatcherFactory
    {
        public static IDispatcher GetDispatcher()
        {
            return Application.Current != null ? new AppDispatcher(Application.Current.Dispatcher) : new AppDispatcher();
        }

        private class AppDispatcher : IDispatcher
        {
            private readonly Dispatcher _safeDispatcher;
            private readonly Dispatcher _currentDispatcher;

            public AppDispatcher(Dispatcher dispatcher):this()
            {
                _safeDispatcher = dispatcher ?? _currentDispatcher;
            }

            public AppDispatcher()
            {
                _currentDispatcher = Dispatcher.CurrentDispatcher;
                _safeDispatcher = _currentDispatcher;
            }

            private Dispatcher Dispatcher
            {
                get { return _currentDispatcher.CheckAccess() ? _currentDispatcher : _safeDispatcher; }
            }

            void IDispatcher.Invoke(Delegate callback)
            {
                Dispatcher.Invoke(callback);
            }

            object IDispatcher.Invoke(Delegate method, DispatcherPriority priority, params object[] args)
            {
                return Dispatcher.Invoke(method, priority, args);
            }

            DispatcherOperation IDispatcher.BeginInvoke(Delegate callback)
            {
                return Dispatcher.BeginInvoke(callback);
            }

            DispatcherOperation IDispatcher.BeginInvoke(Delegate method, params object[] args)
            {
                return Dispatcher.BeginInvoke(method, args);
            }

            DispatcherOperation IDispatcher.BeginInvoke(Delegate method, DispatcherPriority priority, params object[] args)
            {
                return Dispatcher.BeginInvoke(method, priority, args);
            }


            DispatcherOperation IDispatcher.InvokeAsync(Action callback)
            {
                return Dispatcher.InvokeAsync(callback);
            }

            DispatcherOperation IDispatcher.InvokeAsync(Action callback, DispatcherPriority priority)
            {
                return Dispatcher.InvokeAsync(callback, priority);
            }

            DispatcherOperation<TResult> IDispatcher.InvokeAsync<TResult>(Func<TResult> callback)
            {
                return Dispatcher.InvokeAsync(callback);
            }

            DispatcherOperation<TResult> IDispatcher.InvokeAsync<TResult>(Func<TResult> callback, DispatcherPriority priority)
            {
                return Dispatcher.InvokeAsync(callback, priority);
            }
        }
    }
}
