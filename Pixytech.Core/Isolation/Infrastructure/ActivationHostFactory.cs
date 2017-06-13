using System;
using System.IO;
using Pixytech.Core.Isolation.Activation;

namespace Pixytech.Core.Isolation.Infrastructure
{
    class ActivationHostFactory
    {
        public static IActivationHost CreatActivationHost(IsolationLevel isolationLevel, Action pluginUnloaded)
        {
            if (isolationLevel == IsolationLevel.None)
            {
                return new CurrentDomainHost(pluginUnloaded);
            }

            if (isolationLevel == IsolationLevel.Medium)
            {
                return new AppDomainHost(pluginUnloaded);
            }

            if (isolationLevel == IsolationLevel.Highest)
            {
                return new ProcessHost(pluginUnloaded);
            }

            return null;
        }

        public static AppDomainSetup CreateAppDomainSetup(IPluginToken token)
        {
            //var pluginPath = token.Location.Remove(0, rootFolder.Length);
            //pluginPath),
            var appDomainSetup = new AppDomainSetup
            {
                PrivateBinPath = token.PrivateBinPath,
                ConfigurationFile = token.ConfigurationFile,
                ApplicationBase = token.ApplicationBase
            };

            return appDomainSetup;

        }
    }
}
