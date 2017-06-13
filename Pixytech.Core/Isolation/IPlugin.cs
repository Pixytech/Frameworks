using System;

namespace Pixytech.Core.Isolation
{
    public interface IPlugin : IDisposable
    {
        /// <summary>
        /// Fired when the plug-in assemblies are successfully loaded into the 
        /// AppDomain.
        /// </summary>
        event EventHandler PluginsLoaded;
        /// <summary>
        /// Fired when the plug-in assemblies and their AppDomain are unloaded.
        /// </summary>
        event EventHandler PluginsUnloaded;

        /// <summary>
        /// Gets or sets the path to the plug-in assemblies.
        /// </summary>
        IPluginToken Pipeline { get;}

        /// <summary>
        /// Gets whether the instance has been disposed.
        /// </summary>
        bool IsDisposed { get; }

        PluginWorker<T, T1> CreateWorker<T, T1>();

        IPlugin With(IsolationLevel isolationLevel);

        TInterface Create<TInterface>() where TInterface : class, IDisposable;

        TInterface Create<TInterface>(object[] paremeters) where TInterface : class, IDisposable;

        IObjectSponsor<TInterface> CreateDisposable<TInterface>() where TInterface : class;

        IObjectSponsor<TInterface> CreateDisposable<TInterface>(object[] paremeters) where TInterface : class;

        int ProcessId { get; }
    }
}
