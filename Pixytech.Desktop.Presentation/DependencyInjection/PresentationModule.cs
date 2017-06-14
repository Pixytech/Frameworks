using Pixytech.Core.IoC;
using Pixytech.Desktop.Presentation.Helpers;
using Pixytech.Desktop.Presentation.Services;

namespace Pixytech.Desktop.Presentation.DependancyInjection
{
    public class PresentationModule :IModule
    {
        public void Configure(IConfigureTypes configurer)
        {
            configurer.ConfigureType<ResourceAggregatorService>(ObjectLifecycle.SingleInstance);
            configurer.ConfigureType<FileDialogService>(ObjectLifecycle.SingleInstance);
            configurer.ConfigureType<MessagBoxService>(ObjectLifecycle.SingleInstance);
            configurer.ConfigureType<DialogService>(ObjectLifecycle.SingleInstance);
            configurer.ConfigureType<ThemeService>(ObjectLifecycle.SingleInstance);
            configurer.ConfigureType<DefaultClipboard>(ObjectLifecycle.InstancePerCall);
        }
    }
}
