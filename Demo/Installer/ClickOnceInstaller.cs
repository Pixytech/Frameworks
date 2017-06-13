using System;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Security.AccessControl;
using Pixytech.Core.Logging;
using Microsoft.Win32;

namespace Demo.Installer
{
    class ClickOnceInstaller : IPlatformInstaller
    {
        private readonly ILog _logger = LogManager.GetLogger(typeof(ClickOnceInstaller));

        public void Install(string applicationId)
        {
            
            var appRegistryKey = GetUninstallRegistry(applicationId);
            if (appRegistryKey != null)
            {
                UpdateUninstaller(appRegistryKey, applicationId);
                UpdateDisplayIcon(appRegistryKey);
                SetHelpLink(appRegistryKey);
                SetNoModify(appRegistryKey);
                SetNoRepair(appRegistryKey);
                SetUrlInfoAbout(appRegistryKey);
            }
        }

        public bool UnInstall(string applicationId)
        {
            _logger.InfoFormat("Running uninstaller for application {0}", applicationId);

            var uninstallString = GetUninstallString(applicationId);

            if (!string.IsNullOrEmpty(uninstallString))
            {
                var originalAction = uninstallString.Replace("rundll32.exe", "").Trim();

                using (var process = new Process())
                {
                    process.StartInfo = new ProcessStartInfo("rundll32.exe", originalAction) { UseShellExecute = false };
                    process.Start();
                    process.WaitForExit();
                }
            }

            return IsUninstalled(applicationId);
        }

        private string GetUninstallString(string applicationId)
        {
             var appRegistryKey = GetUninstallRegistry(applicationId);
            if (appRegistryKey != null)
            {
                return string.Format("{0}", appRegistryKey.GetValue("OriginalUninstallString"));
            }

            return null;
        }

        private bool IsUninstalled(string applicationId)
        {
            return GetUninstallRegistry(applicationId) == null;
        }

        private void UpdateUninstaller(RegistryKey applicationRegKey,string applicationId)
        {
            _logger.InfoFormat("updating uninstaller key ", applicationId);
            var uninstallString = (string) applicationRegKey.GetValue("UninstallString");
            if (uninstallString.StartsWith("rundll32.exe"))
            {
                var str = string.Format("{0} \"uninstall={1}\"",
                    Assembly.GetExecutingAssembly().Location, new Uri(applicationId).AbsolutePath);
                applicationRegKey.SetValue("OriginalUninstallString", uninstallString);
                applicationRegKey.SetValue("UninstallString", str);
            }
        }
        
        private void UpdateDisplayIcon(RegistryKey applicationRegKey)
        {
            _logger.InfoFormat("Updating display icon {0}", Assembly.GetExecutingAssembly().Location);
            applicationRegKey.SetValue("DisplayIcon", Assembly.GetExecutingAssembly().Location);
        }

        private void SetNoModify(RegistryKey applicationRegKey)
        {
            _logger.InfoFormat("Updating NoModify");
            applicationRegKey.SetValue("NoModify", 1, RegistryValueKind.DWord);
        }

        private void SetNoRepair(RegistryKey applicationRegKey)
        {
            _logger.InfoFormat("Updating NoRepair");
            applicationRegKey.SetValue("NoRepair", 1, RegistryValueKind.DWord);
        }

        private void SetHelpLink(RegistryKey applicationRegKey)
        {
            applicationRegKey.SetValue("HelpLink", "http://www.demo.com/", RegistryValueKind.String);
        }

        private void SetUrlInfoAbout(RegistryKey applicationRegKey)
        {
            applicationRegKey.SetValue("URLInfoAbout", "http://www.demo.com/", RegistryValueKind.String);
        }

        private RegistryKey GetUninstallRegistry(string urlUpdateInfo)
        {
            var subKey = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall");
            if (subKey == null)
                return null;
            foreach (var name in subKey.GetSubKeyNames())
            {
                var application = subKey.OpenSubKey(name, RegistryKeyPermissionCheck.ReadWriteSubTree,
                    RegistryRights.QueryValues | RegistryRights.ReadKey | RegistryRights.SetValue);
                if (application == null)
                    continue;
                foreach (var appKey in application.GetValueNames().Where(appKey => appKey.Equals("UrlUpdateInfo")))
                {
                    if (new Uri(application.GetValue(appKey).ToString()).AbsolutePath == (urlUpdateInfo.Contains("://")? new Uri(urlUpdateInfo).AbsolutePath:urlUpdateInfo))
                        return application;
                    break;
                }
            }
            return null;
        }
    }
}
