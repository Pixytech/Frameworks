using System.Collections.Generic;

namespace Pixytech.Desktop.Presentation.Infrastructure.Settings
{
    public interface ISettingsRepository
    {
        void Save<T>(string key, T settings);
        T Load<T>(string key) where T : new();
        bool HasSettings(string key);
    }
}
