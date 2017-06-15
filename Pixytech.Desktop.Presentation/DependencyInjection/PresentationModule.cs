using Pixytech.Core.IoC;
using Pixytech.Desktop.Presentation.Helpers;
using Pixytech.Desktop.Presentation.Infrastructure;
using Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces;
using Pixytech.Desktop.Presentation.Services;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Windows.Data;

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

            BindingOperations.CollectionRegistering -= BindingOperations_CollectionRegistering;
            BindingOperations.CollectionRegistering += BindingOperations_CollectionRegistering;
            

        }

        private void BindingOperations_CollectionRegistering(object sender, CollectionRegisteringEventArgs e)
        {
            if (e.Collection != null && e.Collection is INotifyCollectionChanged)
            {
                var @lock = ObjectFactory.Builder.Build<ICollectionLockProvider>().GetLock(e.Collection);
                BindingOperations.EnableCollectionSynchronization(e.Collection, @lock);
            }
        }
    }
}
