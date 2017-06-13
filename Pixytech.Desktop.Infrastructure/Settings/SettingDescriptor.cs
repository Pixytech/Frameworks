using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace Pixytech.Desktop.Presentation.Infrastructure.Settings
{
    public class SettingDescriptor
    {
        public virtual System.Reflection.PropertyInfo Property
        {
            get;
            private set;
        }
        public virtual object DefaultValue
        {
            get;
            private set;
        }
        public virtual string Description
        {
            get;
            private set;
        }
        public virtual string DisplayName
        {
            get;
            private set;
        }
        public SettingDescriptor(System.Reflection.PropertyInfo property)
        {
            Property = property;
            DisplayName = property.Name;
            ReadAttribute(delegate(DefaultValueAttribute d)
            {
                DefaultValue = d.Value;
            });
            ReadAttribute(delegate(DescriptionAttribute d)
            {
                Description = d.Description;
            });
            ReadAttribute(delegate(DisplayNameAttribute d)
            {
                DisplayName = d.DisplayName;
            });
        }
        private void ReadAttribute<TAttribute>(System.Action<TAttribute> callback)
        {
            IEnumerable<TAttribute> instances = Property.GetCustomAttributes(typeof(TAttribute), true).OfType<TAttribute>();
            foreach (TAttribute instance in instances)
            {
                callback(instance);
            }
        }
        public virtual void Write(object settings, object value)
        {
            Property.SetValue(settings, value, null);
        }
        public virtual object ReadValue(object settings)
        {
            return Property.GetValue(settings, null);
        }
        public SettingDescriptor()
        {
        }
    }
}
