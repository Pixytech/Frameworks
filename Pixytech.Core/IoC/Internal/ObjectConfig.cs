using System;

namespace Pixytech.Core.IoC.Internal
{
    internal class ObjectConfig : IObjectConfig
    {
        private readonly Type _component;
        private readonly IContainer _container;

        public ObjectConfig(Type component, IContainer container)
        {
            _component = component;
            _container = container;
        }

        IObjectConfig IObjectConfig.ConfigureProperty(string name, object value)
        {
            _container.ConfigureProperty(_component, name, value);
            return this;
        }
    }
}
