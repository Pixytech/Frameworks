using System;
using System.Linq.Expressions;

namespace Pixytech.Core.IoC
{
    public interface IObjectConfig<T>
    {
        /// <summary>
        /// Configures the value of the property like so:
        /// ConfigureProperty(o => o.Property, value);
        /// </summary>
        IObjectConfig<T> ConfigureProperty(Expression<Func<T, object>> property, object value);
    }
}
