using Pixytech.Core.Logging;
using Pixytech.Desktop.Presentation.Infrastructure;
using System;

namespace Demo.ViewModels
{
    internal class SplashViewModel : ViewModelBase, ISplash
    {
        private readonly ILog _logger = LogManager.GetLogger(typeof(SplashViewModel));
        private Action _onShutDownAction;

        public string Message
        {
            get { return GetProperty<string>(); }
            set
            {
                SetProperty(value);
                _logger.Info(value);
            }
        }

        public void ShutDown()
        {
            if (_onShutDownAction != null)
            {
                _onShutDownAction.Invoke();
                _onShutDownAction = null;
            }
        }
        public void OnShutDown(Action action)
        {
            _onShutDownAction = action;
        }
    }
}
