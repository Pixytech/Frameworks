using System;
using System.Collections.Generic;
using Pixytech.Core.Isolation.Infrastructure;

namespace Pixytech.Core.Isolation.Activation
{
    internal interface IActivationHost : IDisposable
    {
        int ProcessId { get; }

        bool SearchPlugins(IPluginToken pipeline);

        IObjectSponsor<TInterface> GetImplementation<TInterface>() where TInterface : class;

        IObjectSponsor<TInterface> GetImplementation<TInterface>(object[] parameters) where TInterface : class;

        IEnumerable<IObjectSponsor<TInterface>> GetImplementations<TInterface>() where TInterface : class;

        IEnumerable<IObjectSponsor<TInterface>> GetImplementations<TInterface>(object[] parameters) where TInterface : class;

        IPluginLoader GetLoader();

        void Dispose(bool disposing);
    }
}
