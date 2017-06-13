using Microsoft.Practices.Prism.Modularity;
using Microsoft.Practices.Prism.PubSubEvents;

namespace Pixytech.Desktop.Presentation.Infrastructure.Modulatiry
{
    public class ModuleDownloadProgressEvent : PubSubEvent<ModuleDownloadProgressChangedEventArgs>
    {
    }
}
