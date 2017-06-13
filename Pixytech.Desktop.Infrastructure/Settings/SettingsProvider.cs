using Pixytech.Core.Utilities;

namespace Pixytech.Desktop.Presentation.Infrastructure.Settings
{
    public class SettingsProvider : ISettingsProvider
    {
        private readonly ISettingsRepository _settingsRepository;

        public SettingsProvider(ISettingsRepository settingsRepository)
        {
            _settingsRepository = settingsRepository;
        }

        public T GetSettings<T>(string settingsName) where T : new()
        {
            T result;
            try
            {
                result = _settingsRepository.HasSettings(settingsName) ? LoadSettings<T>( settingsName) : GetDefaultSettings<T>();
            }
            catch
            {
                result = GetDefaultSettings<T>();
            }
            return result;
        }

        public virtual T GetSettings<T>() where T : new()
        {
            return GetSettings<T>(GetKey<T>());
        }

        
        private T GetDefaultSettings<T>() where T : new()
        {
            T defaultSetting = (default(T) == null) ? System.Activator.CreateInstance<T>() : default(T);
            return defaultSetting;
        }

        protected virtual T LoadSettings<T>(string settingsName) where T : new()
        {
            return _settingsRepository.Load<T>(settingsName);
        }


        protected virtual string GetKey<T>()
        {
            System.Type type = typeof(T);
            return GetSettingTypeName(type.FullName);
        }

        public virtual void SaveSettings<T>(T settings)
        {
            SaveSettings(settings, GetKey<T>());
        }


        public void SaveSettings<T>(T settings, string settingsName)
        {
            _settingsRepository.Save(settingsName, settings);
        }

        private static string GetSettingTypeName(string name)
        {
            var id = DeterministicGuid.MakeId(name);
            return id.ToString();
        }

        public SettingsProvider()
        {
        }
    }
}
