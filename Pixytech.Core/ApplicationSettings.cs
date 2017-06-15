using System;
using System.ComponentModel;
using System.Configuration;

namespace Pixytech.Core
{
    [Serializable]
    public class ApplicationSettings : IApplicationSettings
    {
        public ApplicationSettings()
        {
            Root = string.Empty;
        }

        public ApplicationSettings(string rootName)
            : this()
        {
            Root = rootName;
        }

        public string Root { get; set; }

        public T Read<T>(string name, T defaultValue = default(T))
        {
            var fullKey = Root.Length > 0 ? Root + "/" + name : name;

            if (ConfigurationManager.AppSettings[fullKey] != null)
            {
                return ConvertFromString<T>(ConfigurationManager.AppSettings[fullKey]);
            }

            return defaultValue;
        }

        internal T ConvertFromString<T>(string value)
        {
            var converter = TypeDescriptor.GetConverter(typeof(T));
            if (converter.CanConvertFrom(typeof (string)))
            {
                return (T)converter.ConvertFrom(value);
            }
            else
            {
                throw new NotSupportedException("Type converter is not available");
            }
        }


    }
}
