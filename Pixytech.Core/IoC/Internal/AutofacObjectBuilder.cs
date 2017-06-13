using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading;
using Autofac;
using Autofac.Builder;
using Autofac.Core;

namespace Pixytech.Core.IoC.Internal
{
    /// <summary>
    ///  Autofac implementation of <see cref="T:Pixytech.Core.IoC.IContainer" />.
    /// </summary>
    internal class AutofacObjectBuilder : IContainer
    {
        private ILifetimeScope _container;
        private volatile int _disposeSignaled;
        private bool _disposed;

        /// <summary>
        ///  Instantiates the class utilizing the given container.
        /// </summary>
        public AutofacObjectBuilder(ILifetimeScope container)
        {
            _container = (container ?? new ContainerBuilder().Build());
        }

        /// <summary>
        ///  Instantiates the class with an empty Autofac container.
        /// </summary>
        public AutofacObjectBuilder() : this(null)
        {
        }

        public void Dispose()
        {
            #pragma warning disable 420

            if (Interlocked.Exchange(ref _disposeSignaled, 1) != 0)
            {
                return;
            }
            #pragma warning restore 420

            if (_container != null)
            {
                _container.Dispose();
                _container = null;
            }
            _disposed = true;
        }

        /// <summary>
        /// Returns a child instance of the container to facilitate deterministic disposal
        /// of all resources built by the child container.
        /// </summary>
        public IContainer BuildChildContainer()
        {
            ThrowIfDisposed();
            return new AutofacObjectBuilder(_container.BeginLifetimeScope());
        }

        /// <summary>
        ///  Build an instance of a given type using Autofac.
        /// </summary>
        public object Build(Type typeToBuild)
        {
            ThrowIfDisposed();
            return _container.Resolve(typeToBuild);
        }

        /// <summary>
        ///  Build all instances of a given type using Autofac.
        /// </summary>
        public IEnumerable<object> BuildAll(Type typeToBuild)
        {
            ThrowIfDisposed();
            return ResolveAll(_container, typeToBuild);
        }

        void IContainer.Configure(Type component, ObjectLifecycle dependencyLifecycle, bool propertyAutoWired )
        {
            IComponentRegistration registration = GetComponentRegistration(component);
            if (registration != null)
            {
                return;
            }
            var builder = new ContainerBuilder();
            Type[] services = GetAllServices(component).ToArray();
            IRegistrationBuilder<object, ConcreteReflectionActivatorData, SingleRegistrationStyle> registrationBuilder =
                builder.RegisterType(component).As(services);
            if (propertyAutoWired)
            {
                registrationBuilder.PropertiesAutowired();
            }
            SetLifetimeScope(dependencyLifecycle, registrationBuilder);
            builder.Update(_container.ComponentRegistry);
        }   

        void IContainer.Configure(Type component, ObjectLifecycle dependencyLifecycle)
        {
            IComponentRegistration registration = GetComponentRegistration(component);
            if (registration != null)
            {
                return;
            }
            var builder = new ContainerBuilder();
            Type[] services = GetAllServices(component).ToArray();
            IRegistrationBuilder<object, ConcreteReflectionActivatorData, SingleRegistrationStyle> registrationBuilder =
                builder.RegisterType(component).As(services).PropertiesAutowired();
            SetLifetimeScope(dependencyLifecycle, registrationBuilder);
            builder.Update(_container.ComponentRegistry);
        }

        void IContainer.Configure<T>(Func<T> componentFactory, ObjectLifecycle dependencyLifecycle)
        {
            IComponentRegistration registration = GetComponentRegistration(typeof (T));
            if (registration != null)
            {
                return;
            }
            var builder = new ContainerBuilder();
            Type[] services = GetAllServices(typeof (T)).ToArray();
            IRegistrationBuilder<T, SimpleActivatorData, SingleRegistrationStyle> registrationBuilder =
                builder.Register(c => componentFactory())
                    .As(services)
                    .PropertiesAutowired();
            SetLifetimeScope(dependencyLifecycle,
                (IRegistrationBuilder<object, IConcreteActivatorData, SingleRegistrationStyle>) registrationBuilder);
            builder.Update(_container.ComponentRegistry);
        }

        void IContainer.Configure<T>(Func<T> componentFactory, ObjectLifecycle dependencyLifecycle, bool propertyAutoWired)
        {
            IComponentRegistration registration = GetComponentRegistration(typeof(T));
            if (registration != null)
            {
                return;
            }
            var builder = new ContainerBuilder();
            Type[] services = GetAllServices(typeof(T)).ToArray();
            IRegistrationBuilder<T, SimpleActivatorData, SingleRegistrationStyle> registrationBuilder =
                builder.Register(c => componentFactory())
                    .As(services);
            if (propertyAutoWired)
            {
                registrationBuilder.PropertiesAutowired();
            }
            SetLifetimeScope(dependencyLifecycle,
                (IRegistrationBuilder<object, IConcreteActivatorData, SingleRegistrationStyle>)registrationBuilder);
            builder.Update(_container.ComponentRegistry);
        }

        /// <summary>
        ///  Configure the value of a named component property.
        /// </summary>
        public void ConfigureProperty(Type component, string property, object value)
        {
            ThrowIfDisposed();
            var registration = GetComponentRegistration(component);
            if (registration == null)
            {
                string message = "Cannot configure properties for a type that hasn't been configured yet: " +
                                 component.FullName;
                throw new InvalidOperationException(message);
            }
            registration.Activating += (sender, e) => SetPropertyValue(e.Instance, property, value);
        }

        /// <summary>
        ///  Register a singleton instance of a dependency within Autofac.
        /// </summary>
        public void RegisterSingleton(Type lookupType, object instance)
        {
            ThrowIfDisposed();
            var builder = new ContainerBuilder();
            builder.RegisterInstance(instance).As(new[]
            {
                lookupType
            }).PropertiesAutowired();
            builder.Update(_container.ComponentRegistry);
        }

        public bool HasComponent(Type componentType)
        {
            ThrowIfDisposed();
            return _container.IsRegistered(componentType);
        }

        public void Release(object instance)
        {
            ThrowIfDisposed();
        }

        /// <summary>
        ///  Set a property value on an instance using reflection
        /// </summary>
        private static void SetPropertyValue(object instance, string propertyName, object value)
        {
            instance.GetType()
                .GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public)
                .SetValue(instance, value, null);
        }

        private static void SetLifetimeScope(ObjectLifecycle dependencyLifecycle,
            IRegistrationBuilder<object, IConcreteActivatorData, SingleRegistrationStyle> registrationBuilder)
        {
            switch (dependencyLifecycle)
            {
                case ObjectLifecycle.SingleInstance:
                    registrationBuilder.SingleInstance();
                    return;
                case ObjectLifecycle.InstancePerLifetimeScope:
                    registrationBuilder.InstancePerLifetimeScope();
                    return;
                case ObjectLifecycle.InstancePerCall:
                    registrationBuilder.InstancePerDependency();
                    return;
                default:
                    throw new ArgumentException("Unhandled lifecycle - " + dependencyLifecycle);
            }
        }

        private IComponentRegistration GetComponentRegistration(Type concreteComponent)
        {
            return
                _container.ComponentRegistry.Registrations.FirstOrDefault(
                    x => x.Activator.LimitType == concreteComponent);
        }

        private static IEnumerable<Type> GetAllServices(Type type)
        {
            if (type == null)
            {
                return new List<Type>();
            }
            var result = new List<Type>(type.GetInterfaces())
            {
                type
            };
            var interfaces = type.GetInterfaces();
            foreach (Type interfaceType in interfaces)
            {
                result.AddRange(GetAllServices(interfaceType));
            }
            return result.Distinct();
        }

        private static IEnumerable<object> ResolveAll(IComponentContext container, Type componentType)
        {
            return container.Resolve(typeof (IEnumerable<>).MakeGenericType(new[]
            {
                componentType
            })) as IEnumerable<object>;
        }

        private void ThrowIfDisposed()
        {
            if (_disposed)
            {
                throw new ObjectDisposedException("AutofacObjectBuilder");
            }
        }
    }
}
