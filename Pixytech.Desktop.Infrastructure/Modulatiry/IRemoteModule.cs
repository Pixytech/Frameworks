using Pixytech.Core.IoC;

namespace Pixytech.Desktop.Presentation.Infrastructure.Modulatiry
{
    public interface IRemoteModule : IModule, Microsoft.Practices.Prism.Modularity.IModule
    {
        string ComponentName { get; }
    }
}
