using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading;

namespace Pixytech.Core.IoC.Internal
{
    /// <summary>
    /// Implementation of IBuilder, serving as a facade that container specific implementations
    /// of IContainer should run behind.
    /// </summary>
    public class ObjectBuilder : IBuilder, IConfigureTypes
    {
        private bool _synchronized;
        private static SynchronizedInvoker _sync;
        private IContainer _container;
        private volatile int _disposeSignaled;
        private bool _disposed;

        /// <summary>
        /// The container that will be used to create objects and configure components.
        /// </summary>
        public IContainer Container
        {
            get
            {
                ThrowIfDisposed();
                return _container;
            }
            set
            {
                ThrowIfDisposed();
                _container = value;
                if (_sync != null)
                {
                    _sync.Container = value;
                }
            }
        }

        /// <summary>
        /// Used for multi-threaded rich clients to build and dispatch
        /// in a synchronization domain.
        /// </summary>
        public bool Synchronized
        {
            get
            {
                ThrowIfDisposed();
                return _synchronized;
            }
            set
            {
                ThrowIfDisposed();
                _synchronized = value;
                if (_synchronized)
                {
                    if (_sync == null)
                    {
                        _sync = new SynchronizedInvoker();
                    }
                    _sync.Container = _container;
                }
            }
        }

        public IObjectConfig ConfigureType(Type concreteComponent, ObjectLifecycle instanceLifecycle)
        {
            ThrowIfDisposed();
            _container.Configure(concreteComponent, instanceLifecycle);
            return new ObjectConfig(concreteComponent, _container);
        }

        public IObjectConfig<T> ConfigureType<T>(ObjectLifecycle instanceLifecycle, bool propertyAutoWired)
        {
            ThrowIfDisposed();
            _container.Configure(typeof(T), instanceLifecycle, propertyAutoWired);
            return new ObjectConfig<T>(_container);
        }

        public IObjectConfig ConfigureType(Type concreteComponent, ObjectLifecycle instanceLifecycle, bool propertyAutoWired)
        {
            ThrowIfDisposed();
            _container.Configure(concreteComponent, instanceLifecycle, propertyAutoWired);
            return new ObjectConfig(concreteComponent, _container);
        }

        public IObjectConfig<T> ConfigureType<T>(ObjectLifecycle instanceLifecycle)
        {
            ThrowIfDisposed();
            _container.Configure(typeof(T), instanceLifecycle);
            return new ObjectConfig<T>(_container);
        }

        public void ForAllTypes<T>(Action<Type> action, params Assembly[] assemblies) where T : class
        {
            (
               from t in GetAllTypes<T>(assemblies)
               where typeof(T).IsAssignableFrom(t) && !t.IsAbstract && !t.IsInterface
               select t).ToList<Type>().ForEach(action);
        }

        private IEnumerable<Type> GetAllTypes<T>(params Assembly[] assemblies)
        {
            var types = new List<Type>();
            foreach (var assembly in assemblies)
            {
                types.AddRange(assembly.GetTypes().Where(type => typeof(T).IsAssignableFrom(type)));
            }

            return types;
        }

        public IObjectConfig<T> ConfigureType<T>(Func<T> componentFactory, ObjectLifecycle instanceLifecycle)
        {
            ThrowIfDisposed();
            _container.Configure<T>(componentFactory, instanceLifecycle);
            return new ObjectConfig<T>(_container);
        }

        public IObjectConfig<T> ConfigureType<T>(Func<IBuilder, T> componentFactory, ObjectLifecycle instanceLifecycle)
        {
            ThrowIfDisposed();
            _container.Configure<T>(() => componentFactory(this), instanceLifecycle);
            return new ObjectConfig<T>(_container);
        }
       
        public IConfigureTypes ConfigureProperty<T>(Expression<Func<T, object>> property, object value)
        {
            ThrowIfDisposed();
            PropertyInfo prop = Reflect<T>.GetProperty(property);
            return ((IConfigureTypes)this).ConfigureProperty<T>(prop.Name, value);
        }

        public IConfigureTypes ConfigureProperty<T>(string propertyName, object value)
        {
            ThrowIfDisposed();
            _container.ConfigureProperty(typeof(T), propertyName, value);
            return this;
        }
        IConfigureTypes IConfigureTypes.RegisterSingleton(Type lookupType, object instance)
        {
            _container.RegisterSingleton(lookupType, instance);
            return this;
        }

        public IConfigureTypes RegisterSingleton<T>(object instance)
        {
            ThrowIfDisposed();
            _container.RegisterSingleton(typeof(T), instance);
            return this;
        }

        public bool HasComponent<T>()
        {
            ThrowIfDisposed();
            return _container.HasComponent(typeof(T));
        }

        public bool HasComponent(Type componentType)
        {
            ThrowIfDisposed();
            return _container.HasComponent(componentType);
        }

        public void AddModule<T>() where T : IModule
        {
           Container.AddModule<T>();
        }

        public IBuilder CreateChildBuilder()
        {
            ThrowIfDisposed();
            return new ObjectBuilder
            {
                Container = _container.BuildChildContainer()
            };
        }

        public void Dispose()
        {
            #pragma warning disable 420
            if (Interlocked.Exchange(ref _disposeSignaled, 1) != 0)
            {
                return;
            }
        #pragma warning restore 420
            DisposeManaged();
            _disposed = true;
        }

        public void DisposeManaged()
        {
            if (_container != null)
            {
                _container.Dispose();
            }
        }

        public T Build<T>()
        {
            ThrowIfDisposed();
            return (T)_container.Build(typeof(T));
        }

        public object Build(Type typeToBuild)
        {
            ThrowIfDisposed();
            return _container.Build(typeToBuild);
        }

        IEnumerable<object> IBuilder.BuildAll(Type typeToBuild)
        {
            return _container.BuildAll(typeToBuild);
        }

        void IBuilder.Release(object instance)
        {
            _container.Release(instance);
        }

        public IEnumerable<T> BuildAll<T>()
        {
            ThrowIfDisposed();
            return _container.BuildAll(typeof(T)).Cast<T>();
        }

        public void BuildAndDispatch(Type typeToBuild, Action<object> action)
        {
            ThrowIfDisposed();
            if (_sync != null)
            {
                _sync.BuildAndDispatch(typeToBuild, action);
                return;
            }
            object o = _container.Build(typeToBuild);
            action(o);
        }
       
        private void ThrowIfDisposed()
        {
            if (_disposed)
            {
                throw new ObjectDisposedException("CommonObjectBuilder");
            }
        }
    }
}
