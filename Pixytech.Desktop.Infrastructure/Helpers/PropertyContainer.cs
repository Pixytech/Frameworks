using System.Collections.Generic;
using System.Linq;

namespace Pixytech.Desktop.Presentation.Infrastructure.Helpers
{
    internal class PropertyContainer
    {
        private readonly Dictionary<string, object> _values = new Dictionary<string, object>();

        public T Get<T>(T defaultValue, string name)
        {
            T result;
            if (_values.ContainsKey(name))
            {
                result = (T)_values[name];
            }
            else
            {
                result = defaultValue;
            }

            return result;
        }

        public bool Set<T>(T value, string name)
        {
            if (_values.ContainsKey(name))
            {
                if (Equals(_values[name], value))
                {
                    return false;
                }

                _values[name] = value;
            }
            else
            {
                _values.Add(name, value);
            }

            return true;
        }

        public IEnumerable<string> PropertyNames
        {
            get { return _values.Keys.ToList(); }
        }
    }
}
