namespace Pixytech.Desktop.Presentation.Infrastructure.Settings
{
    public interface ISettingsProvider
    {
        T GetSettings<T>() where T : new();
        void SaveSettings<T>(T settings);

        T GetSettings<T>(string settingsName) where T : new();
        void SaveSettings<T>(T settings, string settingsName);
    }
}
