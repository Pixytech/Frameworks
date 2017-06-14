using Pixytech.Core.Logging;
using Microsoft.Win32;

namespace Demo.Installer
{
    class CustomProtocolInstaller : IPlatformInstaller
    {
        private readonly ILog _logger = LogManager.GetLogger(typeof(CustomProtocolInstaller));
        public void Install(string applicationId)
        {
            if (Registry.CurrentUser.OpenSubKey("Software\\Classes\\dashApp") == null)
            {
                _logger.InfoFormat("Installing custom protocol Software\\Classes\\dashApp");

                var protocol = Registry.CurrentUser.CreateSubKey("Software\\Classes\\dashApp");
                if (protocol != null)
                {
                    protocol.SetValue(string.Empty, "URL:Demo dashboard application protocol");
                    protocol.SetValue("URL Protocol", string.Empty);
                    var shell = protocol.CreateSubKey("shell");
                    if (shell != null)
                    {
                        var open = shell.CreateSubKey("open");
                        if (open != null)
                        {
                            var command = open.CreateSubKey("command");

                            if (command != null)
                            {
                                var protcolString = "\"PresentationHost.exe\"" + " \"-LaunchApplication\" \"" + applicationId + "?%1\"";
                                command.SetValue(string.Empty, protcolString);
                                _logger.InfoFormat("Custom protocol installed as {0}", protcolString);
                            }
                        }
                    }
                }
            }
        }

        public bool UnInstall(string applicationId)
        {
            // we have to uninstall com and other stuff in registry then unintsall clickonce
            if (Registry.CurrentUser.OpenSubKey("Software\\Classes\\dashApp") != null)
            {
                _logger.InfoFormat("UnInstalling custom protocol Software\\Classes\\dashApp");
                Registry.CurrentUser.DeleteSubKeyTree("Software\\Classes\\dashApp");
            }

            return true;
        }
    }
}
