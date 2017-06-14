using Demo.Presentation.Infrastructure;
using Demo.Module.Shell.ViewModels;
using Microsoft.Practices.Prism.Regions;
using Pixytech.Core.IoC;
using Pixytech.Core.Logging;
using Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pixytech.Desktop.Presentation
{
    public class ShellModule : IModule, Microsoft.Practices.Prism.Modularity.IModule
    {
        private readonly ILog _logger = LogManager.GetLogger(typeof(ShellModule));
        private readonly IRegionManager _regionManager;
        private readonly IResourceAggregator _resourceAggregator;
        private readonly IConfigureTypes configurer;

        public ShellModule(IRegionManager regionManager, IResourceAggregator resourceAggregator, IConfigureTypes configurer)
        {
            _regionManager = regionManager;
            _resourceAggregator = resourceAggregator;
            this.configurer = configurer;
            _logger.InfoFormat("Instance created");
          
        }

        public void Initialize()
        {
            _logger.InfoFormat("Initialize");
            Configure(this.configurer);
            _resourceAggregator.AddResource("Resources/ViewMappings.xaml");

            // Shell

            _regionManager.RegisterViewWithRegion(RegionNames.ShellRegion, typeof(MainWindowVm));
            _regionManager.RegisterViewWithRegion(RegionNames.MainRegion, typeof(WelcomeVm));
  }

        public void Configure(IConfigureTypes configurer)
        {
            _logger.InfoFormat("Configure");

            // Shell Stuff
            configurer.ConfigureType<MainWindowVm>(ObjectLifecycle.SingleInstance);
        }
    }
}
