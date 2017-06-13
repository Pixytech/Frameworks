using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.ExceptionManagement;
using Graphnet.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure.Commands;

namespace Graphnet.Dashboard.CoreUI.ViewModels
{
    class ErrorWindowVm : ViewModelBase
    {
        private readonly IErrorContainer _errorContainer;
        public ErrorWindowVm(IErrorContainer errorContainer)
        {
            _errorContainer = errorContainer;
            ClearCommand = new DelegateCommand(OnClearErrors, CanClearError);
        }

        private bool CanClearError()
        {
            return _errorContainer.HasErrors;
        }

        private void OnClearErrors()
        {
            _errorContainer.Clear();
        }

        public DelegateCommand ClearCommand { get; private set; }

        public IErrorContainer ErrorContainer
        {
            get { return _errorContainer; }
        }
    }
}
