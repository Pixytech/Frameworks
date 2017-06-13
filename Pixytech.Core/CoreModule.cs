using Pixytech.Core.Discovery;
using Pixytech.Core.IoC;
using Pixytech.Core.Isolation;
//using Pixytech.Core.PubSubEvents;

namespace Pixytech.Core
{
    public class CoreModule : IModule
    {
        public void Configure(IConfigureTypes configurer)
        {
            configurer.ConfigureType<AssemblyScanner>(ObjectLifecycle.InstancePerCall);
            configurer.ConfigureType<AssembliesHost>(ObjectLifecycle.InstancePerCall);
            configurer.ConfigureType<Clock>(ObjectLifecycle.SingleInstance);
            configurer.ConfigureType<PluginToken>(ObjectLifecycle.InstancePerCall);
            configurer.ConfigureType<Plugin>(ObjectLifecycle.InstancePerCall);
            //c.ConfigureType<EventAggregator>(ObjectLifecycle.SingleInstance);
            configurer.ConfigureType<ApplicationSettings>(ObjectLifecycle.SingleInstance);
        }
    }
}
