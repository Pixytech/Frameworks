using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using Pixytech.Core.Isolation.Infrastructure;
using System.Linq;
namespace Pixytech.Core.Isolation.Activation
{
    [Serializable]
    internal abstract class ActivationHost : IActivationHost
    {
        private bool _isConnected;
        private readonly Action _pluginUnloaded;
        protected IPluginLoader PluginLoader;
        private Sponsor<IPluginLoader> _sponsor;
        private bool _isDisposed;

        protected ActivationHost(Action pluginUnloaded)
        {
            _pluginUnloaded = pluginUnloaded;
        }

        protected abstract bool Connect(IPluginToken pipeline);

        protected abstract bool Disconnect();

        protected abstract IPluginLoader CreateLoader();

        public IPluginLoader GetLoader()
        {
            return PluginLoader;
        }

        public bool SearchPlugins(IPluginToken pipeline)
        {
            Pipeline = pipeline;
            // unload any existing AppDomain and create a new one for the plugins
            UnloadDomain();
            CreateDomain(pipeline);

            // only attempt to load plugins if the plugin directory exists
            if ( !pipeline.AssemblyCache.Any() && !Directory.Exists(pipeline.Location))
            {
                throw new Exception("Invalid plugin directory");
            }

            // load plugins in the other AppDomain
            PluginLoader.Init(pipeline);
            return true;
        }

        protected IPluginToken Pipeline { get; private set; }

        private void CreateDomain(IPluginToken pipeline)
        {
            if (!_isConnected)
            {
                _isConnected = Connect(pipeline);
            }

            // instantiate PluginLoader in the other AppDomain
            PluginLoader = CreateLoader();

            // since Sandbox was loaded from another AppDomain, we must sponsor 
            // it for as long as we need it
            _sponsor = new Sponsor<IPluginLoader>(PluginLoader);

        }

        /// <summary>
        /// Unloads the AppDomain used for plugins.
        /// </summary>
        protected void UnloadDomain()
        {
            if (_isConnected)
            {
                // we dont want to have any exceptions at this stage
                try
                {
                    _sponsor.Dispose();
                }
                catch 
                {
                    
                }
                PluginLoader = null;

                Disconnect();
                _isConnected = false;

                // raise the PluginsUnloaded event
                if (_pluginUnloaded != null) _pluginUnloaded.Invoke();
            }
        }

        /// <summary>
		/// Finaliser.
		/// </summary>
		~ActivationHost() {
			Dispose(false);
		}

        public IObjectSponsor<TInterface> GetImplementation<TInterface>() where TInterface : class
        {
            return GetImplementation<TInterface>(null);
        }

        public IObjectSponsor<TInterface> GetImplementation<TInterface>(object[] parameters) where TInterface : class
        {
            var instance = PluginLoader.GetImplementation<TInterface>(parameters);

            return CreateSponsor(instance);
        }


        protected virtual IObjectSponsor<TInterface> CreateSponsor<TInterface>(TInterface instance) where TInterface : class
        {
            return instance != null ? new Sponsor<TInterface>(instance) : null;
        }

        /// <summary>
        /// Returns the types of all classes that implement the specified interface across all loaded assemblies
        /// </summary>
        /// <returns></returns>
        public IEnumerable<IObjectSponsor<TInterface>> GetImplementations<TInterface>(object[] parameters) where TInterface : class
        {
            var instances = new LinkedList<Sponsor<TInterface>>();

            foreach (TInterface instance in PluginLoader.GetImplementations<TInterface>(parameters))
            {
                instances.AddLast(new Sponsor<TInterface>(instance));
            }

            return instances;
        }

        public IEnumerable<IObjectSponsor<TInterface>> GetImplementations<TInterface>() where TInterface : class
        {
            return GetImplementations<TInterface>(null);
        }


        public virtual void Dispose(bool disposing)
        {
            if (!_isDisposed)
            {
                if (disposing)
                {
                    if (_isConnected)
                    {
                        UnloadDomain();
                    }
                }
                _isDisposed = true;
            }
        }

        public void Dispose()
        {
           Dispose(true);
            GC.SuppressFinalize(this);
        }

        public int ProcessId
        {
            get
            {
                if(_isConnected)
                    return PluginLoader.ProcessId;
                return 0;
            }
        }
    }
}
