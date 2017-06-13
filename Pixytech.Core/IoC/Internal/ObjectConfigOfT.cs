using System;
using System.Linq.Expressions;
using System.Reflection;

namespace Pixytech.Core.IoC.Internal
{
    internal class ObjectConfig<T> : ObjectConfig, IObjectConfig<T>
    {
        public ObjectConfig(IContainer container)
            : base(typeof (T), container)
        {

        }

        IObjectConfig<T> IObjectConfig<T>.ConfigureProperty(Expression<Func<T, object>> property, object value)
        {
            PropertyInfo prop = Reflect<T>.GetProperty(property);
            ((IObjectConfig) this).ConfigureProperty(prop.Name, value);
            return this;
        }
    }
}