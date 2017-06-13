using System;
using System.Windows.Input;
using Graphnet.Dashboard.WebContracts;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Helpers;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Matrix;
using Graphnet.Wpf.Presentation.Infrastructure.Commands;

namespace Graphnet.Dashboard.CoreUI.ViewModels
{
    class AboutVm : BasePage, IAboutPage
    {
        private readonly IWebServerUrlProvider _webServerUrlProvider;
        public AboutVm(IWebServerUrlProvider webServerUrlProvider)
        {
            _webServerUrlProvider = webServerUrlProvider;
            Title = "Dashboard";
            LaunchWeb = new DelegateCommand(OnLaunchWebInterface);
        }

        private void OnLaunchWebInterface()
        {
           WebLauncher.Launch(new Uri(_webServerUrlProvider.HostBaseAddress));
        }

        public ICommand LaunchWeb { get; private set; }
    }
}
