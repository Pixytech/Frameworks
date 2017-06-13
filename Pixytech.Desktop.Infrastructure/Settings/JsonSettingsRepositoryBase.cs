using System;
using Newtonsoft.Json;

namespace Pixytech.Desktop.Presentation.Infrastructure.Settings
{
    public abstract class JsonSettingsRepositoryBase : ISettingsRepository
    {
        public virtual void Save<T>(string key, T settings)
        {
            string filename = key + ".settings";
            string serialized = JsonConvert.SerializeObject(settings);
            this.WriteTextFile(filename, serialized);
        }
        protected abstract void WriteTextFile(string filename, string fileContents);

        public virtual T Load<T>(string key) where T : new()
        {
            string filename = key + ".settings";
            string readTextFile = ReadTextFile(filename);
            if (!string.IsNullOrEmpty(readTextFile))
            {
                return JsonConvert.DeserializeObject<T>(readTextFile);
            }
            if (default(T) != null)
            {
                return default(T);
            }
            return Activator.CreateInstance<T>();
        }
        protected abstract string ReadTextFile(string filename);
        public virtual bool HasSettings(string key)
        {
            return true;
        }
    }
}
