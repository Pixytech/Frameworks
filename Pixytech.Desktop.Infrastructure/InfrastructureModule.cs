using Pixytech.Core.IoC;
using Pixytech.Desktop.Presentation.Infrastructure.Helpers;
using Pixytech.Desktop.Presentation.Infrastructure.Settings;

namespace Pixytech.Desktop.Presentation.Infrastructure
{
    public class InfrastructureModule : IModule
    {
        public void Configure(IConfigureTypes configurer)
        {
            configurer.ConfigureType<SettingsProvider>(ObjectLifecycle.InstancePerCall);
            configurer.ConfigureType<IsolatedStorageSettingsRepository>(ObjectLifecycle.InstancePerCall);
            configurer.ConfigureType<IDispatcher>(DispatcherFactory.GetDispatcher, ObjectLifecycle.InstancePerCall);
        }
    }
}
