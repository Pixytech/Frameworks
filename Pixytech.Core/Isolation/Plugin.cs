using System;
using System.Security.Permissions;
using Pixytech.Core.Isolation.Activation;
using Pixytech.Core.Isolation.Infrastructure;

namespace Pixytech.Core.Isolation
{
    /// <summary>
    /// Utility class for enabling dynamic loading of assemblies and dynamic instantiation of objects 
    /// that adhere to interfaces defined in the integration project.
    /// </summary>
    [SecurityPermission(SecurityAction.LinkDemand, ControlAppDomain = true, Infrastructure = true)]
    public class Plugin : IPlugin
    {
        public delegate IPlugin Factory(IPluginToken pipeline);

        private IActivationHost _activationHost;

        /// <summary>
        /// Fired when the plug-in assemblies are successfully loaded into the 
        /// AppDomain.
        /// </summary>
        public event EventHandler PluginsLoaded;
        /// <summary>
        /// Fired when the plug-in assemblies and their AppDomain are unloaded.
        /// </summary>
        public event EventHandler PluginsUnloaded;

        /// <summary>
        /// Gets or sets the path to the plug-in assemblies.
        /// </summary>
        public IPluginToken Pipeline { get; private set; }
        /// <summary>
        /// Gets whether the instance has been disposed.
        /// </summary>
        public bool IsDisposed { get; private set; }

        /// <summary>
        /// Initalises a new instance of the PluginHost class using the specified 
        /// path to the plugin assemblies.
        /// </summary>
        public Plugin(IPluginToken pipeline)
        {
            Pipeline = pipeline;
        }

        /// <summary>
        /// Finalizer.
        /// </summary>
        ~Plugin()
        {
            Dispose(false);
        }

        /// <summary>
        /// Disposes the instance.
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Disposes the instance.
        /// </summary>
        /// <param name="disposing"></param>
        protected virtual void Dispose(bool disposing)
        {
            if (!IsDisposed)
            {
                if (disposing)
                {
                   
                    IsDisposed = true;
                }
            }

            if (_activationHost != null)
            {
                _activationHost.Dispose();
                _activationHost = null;
            }
        }

        public PluginWorker<T, T1> CreateWorker<T, T1>()
        {
            return _activationHost.GetLoader().CreateWorker<T, T1>();
        }

        public IPlugin With(IsolationLevel isolationLevel)
        {
             _activationHost = ActivationHostFactory.CreatActivationHost(isolationLevel, OnPluginUnloaded);

             if (_activationHost == null)
            {
                throw new NotImplementedException();
            }

             if (_activationHost.SearchPlugins(Pipeline))
            {
                // raise the PluginsLoaded event
                if ((PluginsLoaded != null)) PluginsLoaded(null, EventArgs.Empty);
            }

            return this;
        }

        private IObjectSponsor<TInterface> CreateSponsor<TInterface>(object[] parameters) where TInterface : class
        {
            var result = _activationHost.GetImplementation<TInterface>(parameters);

            return result;
        }

        private void OnPluginUnloaded()
        {
            // raise the PluginsLoaded event
            if ((PluginsUnloaded != null)) PluginsUnloaded(this, EventArgs.Empty);
        }

        public TInterface Create<TInterface>() where TInterface : class,IDisposable
        {
            return Create<TInterface>(null);
        }

        public TInterface Create<TInterface>(object[] paremeters) where TInterface : class, IDisposable
        {
            return CreateDisposable<TInterface>(paremeters).Instance;
        }

        public IObjectSponsor<TInterface> CreateDisposable<TInterface>() where TInterface : class
        {
            return CreateDisposable<TInterface>(null);
        }

        public IObjectSponsor<TInterface> CreateDisposable<TInterface>(object[] paremeters) where TInterface : class
        {
            return CreateSponsor<TInterface>(paremeters);
        }


        public int ProcessId
        {
            get { return  _activationHost.ProcessId; }
        }
    }
}
