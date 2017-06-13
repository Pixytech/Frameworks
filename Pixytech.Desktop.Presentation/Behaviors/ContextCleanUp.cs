using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using Pixytech.Core.Utilities;
using Pixytech.Desktop.Presentation.Infrastructure;

namespace Pixytech.Desktop.Presentation.Behaviors
{
    public class ContextCleanUp: BehaviorBase<FrameworkElement>
    {
        private CancellationTokenSource _cancellationToken;

        protected override void OnSetup()
        {
            AssociatedObject.DataContextChanged += AssociatedObject_DataContextChanged;
            ContextInitialize();
        }

        private void ContextInitialize()
        {
            var @base = AssociatedObject.DataContext as ViewModelBase;

            if (_cancellationToken != null && !_cancellationToken.IsCancellationRequested)
            {
                _cancellationToken.Cancel();
                
            }
            if (@base != null)
            {
                _cancellationToken = new CancellationTokenSource();
                Task.Run(() => @base.Initialize(), _cancellationToken.Token);
            }
        }

        private void ContextCleanup()
        {
            var @base = AssociatedObject.DataContext as ViewModelBase;

            if (_cancellationToken != null && !_cancellationToken.IsCancellationRequested)
            {
                _cancellationToken.Cancel();
            }

            if (@base != null)
            {
                @base.Cleanup();
            }
        }

        void AssociatedObject_DataContextChanged(object sender, DependencyPropertyChangedEventArgs e)
        {
            ContextCleanup();
            ContextInitialize();
        }

        protected override void OnCleanup()
        {
            AssociatedObject.DataContextChanged -= AssociatedObject_DataContextChanged;
            ContextCleanup();
        }
    }
}
