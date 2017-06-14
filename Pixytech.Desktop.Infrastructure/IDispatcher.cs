using System;
using System.Windows.Threading;

namespace Pixytech.Desktop.Presentation.Infrastructure
{
    [Obsolete()]
    public interface IDispatcher
    {
        void Invoke(Delegate callback);

        object Invoke(Delegate method, DispatcherPriority priority, params object[] args);

        DispatcherOperation BeginInvoke(Delegate callback);
        DispatcherOperation BeginInvoke(Delegate method, params object[] args);
        DispatcherOperation BeginInvoke(Delegate method, DispatcherPriority priority, params object[] args);

        DispatcherOperation InvokeAsync(Action callback);
        DispatcherOperation InvokeAsync(Action callback, DispatcherPriority priority);

        DispatcherOperation<TResult> InvokeAsync<TResult>(Func<TResult> callback);
        DispatcherOperation<TResult> InvokeAsync<TResult>(Func<TResult> callback, DispatcherPriority priority);
    }
}
