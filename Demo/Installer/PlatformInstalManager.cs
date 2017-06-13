using System.Diagnostics;
using System.IO;
using Pixytech.Core.Logging;
using Pixytech.Desktop.Presentation.Infrastructure;

namespace Demo.Installer
{
    class PlatformInstalManager : IPlatformInstaller
    {
        private readonly ILog _logger = LogManager.GetLogger(typeof(PlatformInstalManager));
        private readonly IPlatformInstaller _clickOnceInstaller;
        private readonly IPlatformInstaller _protocolInstaller;
        private readonly ISplash _splashViewModel;

        //TODO inject different installers
        public PlatformInstalManager(ISplash splashViewModel, ClickOnceInstaller clickOnceInstaller,CustomProtocolInstaller customProtocolInstaller)
        {
            _splashViewModel = splashViewModel;
            _splashViewModel.Message = "Initializing Platform Manager";

            _clickOnceInstaller = clickOnceInstaller;
            
            _protocolInstaller = customProtocolInstaller;
        }

        public void Install(string applicationId)
        {
            _splashViewModel.Message = string.Format("Updating platform ..");
            _logger.InfoFormat("Install for application {0}", applicationId);
            _protocolInstaller.Install(applicationId);
            //_comInstaller.Install(applicationId);
            _clickOnceInstaller.Install(applicationId);
        }

        public bool UnInstall(string applicationId)
        {
            _splashViewModel.Message = string.Format("Uninstalling platform for application..");

            if (_clickOnceInstaller.UnInstall(applicationId))
            {
                _logger.InfoFormat("UnInstall for application {0}", applicationId);
                //_comInstaller.UnInstall(applicationId);
                _protocolInstaller.UnInstall(applicationId);
                TerminateAllInstancesExceptThis();
                return true;
            }

            _logger.InfoFormat("UnInstall for application {0} will not be performed", applicationId);
            return false;
        }

        private static void TerminateAllInstancesExceptThis()
        {
            var exeName = Path.GetFileNameWithoutExtension(Process.GetCurrentProcess().MainModule.FileName);
            foreach (var process in Process.GetProcessesByName(exeName))
            {
                if (process.Id != Process.GetCurrentProcess().Id)
                {
                    process.Kill();
                }
            }
        }
    }
}
