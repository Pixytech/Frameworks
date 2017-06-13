using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Pixytech.Core.Logging;
using Pixytech.Core.Utilities;
using Demo.Presentation.Infrastructure.Services;
using Pixytech.Desktop.Presentation.Infrastructure;
using Microsoft.Practices.Prism.Modularity;

namespace Demo.Modules
{
    class RemoteModuleManager : IRemoteModuleManager
    {
        private readonly ILog _logger = LogManager.GetLogger(typeof(RemoteModuleManager));
        private readonly ISplash _splashViewModel;
        
        private readonly IModuleManager _manager;
        private Action<Exception> _finishedCallback;
        
        private readonly IWebServerUrlProvider _urlProvider;
        
        private readonly IRemoteModulesCatalog _remoteCatalog;
        
        
        public RemoteModuleManager(ISplash splashViewModel, IRemoteModulesCatalog remoteCatalog, IModuleManager manager,  IWebServerUrlProvider urlProvider)
        {
            _splashViewModel = splashViewModel;
            _manager = manager;
            _urlProvider = urlProvider;
            _remoteCatalog = remoteCatalog;
            _logger.InfoFormat("Initialized");
        }

        public IEnumerable<ModuleInfo> Build()
        {
            _remoteCatalog.Clear();

            AsyncHelpers.RunSync(() => BuildAsync());
           

            return _remoteCatalog.Modules;
        }

        private async Task<IEnumerable<ModuleInfo>> BuildAsync()
        {
            _splashViewModel.Message = "Building remote module catalog definations ...";

            var modules = new List<ModuleMetaData>(); // await _coreService.GetModulesMetaDataAsync();

            var componentsDirectory = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Components");

            foreach (var moduleMetaData in modules)
            {
                if (moduleMetaData.Reference.EndsWith(".xap"))
                {
                    var module = new ModuleInfo
                    {
                        ModuleName = moduleMetaData.Name,
                        InitializationMode = InitializationMode.OnDemand,
                        DependsOn = new Collection<string>(moduleMetaData.DepedendsOn.ToList()),
                    };

                    if (UseLocalModules && File.Exists(Path.Combine(componentsDirectory, moduleMetaData.Reference)))
                    {
                        module.Ref = string.Format("File://{0}", Path.Combine(componentsDirectory, moduleMetaData.Reference));
                    }
                    else
                    {
                        module.Ref = string.Format("{0}{1}", _urlProvider.HostBaseAddress, moduleMetaData.Reference);
                    }

                    _logger.InfoFormat("Admin remote modules Name:{0}, Ref:{1}, DepedendsOn:{2}", module.ModuleName,module.Ref, string.Join(";", module.DependsOn));
                   
                    _remoteCatalog.AddModuleInfo(module);
                }
            }
            return _remoteCatalog.Modules;
        }

        public void DownloadModules(Action<Exception> finishedCallback)
        {
            if (_remoteCatalog.Modules.Any())
            {
                _finishedCallback = finishedCallback;
                _manager.LoadModuleCompleted += _manager_LoadModuleCompleted;
                _manager.ModuleDownloadProgressChanged += _manager_ModuleDownloadProgressChanged;

                foreach (var remoteModule in _remoteCatalog.Modules)
                {
                    _splashViewModel.Message = string.Format("Checking for updated modules '{0}'...",
                        remoteModule.ModuleName);
                    _manager.LoadModule(remoteModule.ModuleName);
                }
            }
            else
            {
                if (finishedCallback != null)
                {
                    finishedCallback.Invoke(null);
                }
            }
        }

        private void _manager_ModuleDownloadProgressChanged(object sender, ModuleDownloadProgressChangedEventArgs e)
        {
            _splashViewModel.Message = string.Format("Downloading module '{0}' {1} % ...", e.ModuleInfo.ModuleName, e.ProgressPercentage);
        }

        private void _manager_LoadModuleCompleted(object sender, LoadModuleCompletedEventArgs e)
        {
            if (e.Error == null)
            {
                _splashViewModel.Message = string.Format("{0} module download.", e.ModuleInfo.ModuleName);
                CheckIfAllmodulesDownloaded(e.ModuleInfo);
            }
            else
            {
                _splashViewModel.Message = string.Format("Error downloading module {0}", e.ModuleInfo.ModuleName);
                _logger.ErrorFormat("Error downloading module {0}", e.ModuleInfo.ModuleName);
                //_errorContainer.AddException(e.Error);
                e.IsErrorHandled = true;
                CompleteDownload(0,e.Error);
            }
        }

        private void CheckIfAllmodulesDownloaded(ModuleInfo moduleInfo)
        {
            var remoteModule = (from x in _remoteCatalog.Modules where x.ModuleName == moduleInfo.ModuleName select x).FirstOrDefault();
            if (remoteModule != null)
            {
                remoteModule.State = moduleInfo.State;
            }

            var initilizedCount = (from x in _remoteCatalog.Modules where x.State == ModuleState.Initialized select x).Count();

            if (_remoteCatalog.Modules.Count() == initilizedCount)
            {
                CompleteDownload(initilizedCount, null);
            }
        }

        private void CompleteDownload(int initilizedCount, Exception ex)
        {
            _splashViewModel.Message = string.Format("All {0} module downloaded", initilizedCount);
            _manager.LoadModuleCompleted -= _manager_LoadModuleCompleted;
            _manager.ModuleDownloadProgressChanged -= _manager_ModuleDownloadProgressChanged;

            if (_finishedCallback != null)
            {
                _finishedCallback.Invoke(ex);
                _finishedCallback = null;
            }
        }

        public bool UseLocalModules { get; set; }
    }
}
