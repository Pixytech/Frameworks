using System;
using System.Linq.Expressions;
using System.Reflection;

namespace Pixytech.Core.IoC
{
    /// <summary>
    /// Used to configure components in the container.
    /// Should primarily be used at startup/initialization time.
    /// </summary>
    public interface IConfigureTypes
    {
        /// <summary>
        /// Configures the given type. Can be used to configure all kinds of properties.
        /// </summary>
        /// <param name="dependencyLifecycle">Defines lifecycle semantics for the given type.</param>
        IObjectConfig ConfigureType(Type concreteComponent, ObjectLifecycle dependencyLifecycle);
        /// <summary>
        /// Configures the given type, allowing to fluently configure properties.
        /// </summary>
        /// <param name="dependencyLifecycle">Defines lifecycle semantics for the given type.</param>
        IObjectConfig<T> ConfigureType<T>(ObjectLifecycle dependencyLifecycle);

        /// <summary>
        /// Perform an action for all types found in given assemblies
        /// </summary>
        
        void ForAllTypes<T>(Action<Type> action, params Assembly[] assemblies) where T : class;

        /// <summary>
        /// Configures the given type, allowing to fluently configure properties.
        /// </summary>
        /// <typeparam name="T">Type to configure</typeparam>
        /// <param name="componentFactory">Factory method that returns the given type</param>
        /// <param name="dependencyLifecycle">Defines lifecycle semantics for the given type.</param>
        IObjectConfig<T> ConfigureType<T>(Func<T> componentFactory, ObjectLifecycle dependencyLifecycle);
        /// <summary>
        /// Configures the given type, allowing to fluently configure properties.
        /// </summary>
        IObjectConfig<T> ConfigureType<T>(Func<IBuilder, T> componentFactory, ObjectLifecycle dependencyLifecycle);


        IObjectConfig<T> ConfigureType<T>(ObjectLifecycle instanceLifecycle, bool propertyAutoWired);

        IObjectConfig ConfigureType(Type concreteComponent, ObjectLifecycle instanceLifecycle, bool propertyAutoWired);
       
        /// <summary>
        /// Configures the given property of the given type to be injected with the given value.
        /// </summary>
        IConfigureTypes ConfigureProperty<T>(Expression<Func<T, object>> property, object value);
        /// <summary>
        /// Configures the given property of the given type to be injected with the given value.
        /// </summary>
        IConfigureTypes ConfigureProperty<T>(string propertyName, object value);
        /// <summary>
        /// Registers the given instance as the singleton that will be returned
        /// for the given type.
        /// </summary>
        IConfigureTypes RegisterSingleton(Type lookupType, object instance);
        /// <summary>
        /// Registers the given instance as the singleton that will be returned
        /// for the given type.
        /// </summary>
        IConfigureTypes RegisterSingleton<T>(object instance);
        /// <summary>
        /// Indicates if a component of the given type has been configured.
        /// </summary>
        bool HasComponent<T>();
        /// <summary>
        /// Indicates if a component of the given type has been configured.
        /// </summary>
        bool HasComponent(Type componentType);

        void AddModule<T>() where T : IModule;
    }
}
