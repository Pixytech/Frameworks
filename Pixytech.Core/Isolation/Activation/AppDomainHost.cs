using System;
using System.Diagnostics;
using System.Security.Permissions;
using Pixytech.Core.Isolation.Infrastructure;

namespace Pixytech.Core.Isolation.Activation
{
    [Serializable]
    [SecurityPermission(SecurityAction.LinkDemand, ControlAppDomain = true, Infrastructure = true)]
    class AppDomainHost : ActivationHost
    {
        
        public AppDomainHost(Action pluginUnloaded) : base(pluginUnloaded)
        {
        }
        
        /// <summary>
        /// Gets or sets the AppDomain into which the plug-ins are loaded.
        /// </summary>
        private AppDomain Domain { get; set; }

        protected override bool Connect(IPluginToken pipeline)
        {
            if (Domain == null)
            {
                //var rootFolder = Path.GetDirectoryName(new Uri(typeof(IAssemblyResolver).Assembly.CodeBase).LocalPath);
                //if (rootFolder == null)
                //{
                //    throw new Exception("Lib folder path not found");
                //}
                //var libFolder = Path.GetFullPath(Path.Combine(rootFolder, "/libs"));
                //var libPath = new DirectoryInfo(libFolder).Name;
                //var pluginPath = pipeline.Location.Replace(rootFolder, string.Empty);
                //var appDomainSetup = new AppDomainSetup
                //{
                //    PrivateBinPath = string.Format("{0};{1}", libPath, pluginPath),
                //    ConfigurationFile = Path.Combine(pipeline.Location, pipeline.Name + ".config"),
                //    ApplicationBase = rootFolder,
                //};

                var appDomainSetup = ActivationHostFactory.CreateAppDomainSetup(pipeline);

                Domain = AppDomain.CreateDomain(pipeline.Name + pipeline.Id, AppDomain.CurrentDomain.Evidence, appDomainSetup, pipeline.PermissionSet);
            }

            return true;
        }

        protected override IPluginLoader CreateLoader()
        {
            
            var knownType = typeof (PluginLoader);

            // instantiate PluginLoader in the other AppDomain
            var loader = Domain.CreateInstanceAndUnwrap(
                knownType.Assembly.FullName,
                knownType.FullName
            );
            return loader as IPluginLoader;
        }

      protected override bool Disconnect()
        {
            if (Domain != null)
            {
                try
                {
                    AppDomain.Unload(Domain);
                }
                catch (Exception ex)
                {
                    Trace.WriteLine("Domain process is not valid {0}", ex.Message);
                }
                Domain = null;
            }
            return true;
        }
    }
}
