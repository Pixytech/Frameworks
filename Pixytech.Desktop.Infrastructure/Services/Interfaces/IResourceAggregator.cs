
using System.Windows;

namespace Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces
{
    public interface IResourceAggregator
    {
        void AddResource(string resourcePath);

        bool TryUpdateResource<T>(string resourceKey, T resourceValue);

        bool TryGetResource<T>(string resourceKey, out T resourceValue);
        bool TryRemoveResource(string resourcePath);

        bool TryGetResourceDictionary(string resourcePath, out ResourceDictionary resourceDictionary);
    }
}
