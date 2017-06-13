using Pixytech.Core.IoC;
using Demo.Modules;
using Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces;
using Microsoft.Practices.Prism.Regions;

namespace Demo
{
    class DashboardModule: IModule, Microsoft.Practices.Prism.Modularity.IModule
    {
        private readonly IRegionManager _regionManager;
        private readonly IResourceAggregator _resourceAggregator;

        public DashboardModule(IRegionManager regionManager, IResourceAggregator resourceAggregator)
        {
            _regionManager = regionManager;
            _resourceAggregator = resourceAggregator;
        }

        public void Initialize()
        {
            ObjectFactory.Configure(Configure);
        }

       public void Configure(IConfigureTypes configurer)
        {
            configurer.ConfigureType<RemoteModuleManager>(ObjectLifecycle.SingleInstance);
        }
    }
}
