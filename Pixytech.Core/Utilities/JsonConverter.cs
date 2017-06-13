using System;
using Newtonsoft.Json;

namespace Pixytech.Core.Utilities
{
    public static class JsonObjectConverter
    {
        public static T DeserializeObject<T>(string data)
        {
            return JsonConvert.DeserializeObject<T>(data);
        }

        public static object DeserializeObject(string data, Type type)
        {
            return JsonConvert.DeserializeObject(data, type);
        }

        public static string SerializeObject(object @object)
        {
            return JsonConvert.SerializeObject(@object);
        }
    }
}
