
using Demo.Presentation.Infrastructure.Services;
using Pixytech.Core.IoC;

namespace Demo.Presentation.Infrastructure
{
    public class InfrastructureModule : IModule
    {
        public void Configure(IConfigureTypes configurer)
        {
            configurer.ConfigureType<RemoteModulesCatalog>(ObjectLifecycle.SingleInstance);
            configurer.ConfigureType<WebServerUrlProvider>(ObjectLifecycle.SingleInstance);
        }
    }
}
