using System;
using System.Collections.Generic;
using System.IO;

namespace Pixytech.Core.Isolation.Infrastructure
{
    public interface IPluginLoader : IPluginContract, IDisposable
    {
        int ProcessId { get; }
        TextWriter Log { get; set; }
        void Init(IPluginToken pipeline);
        void Uninit();
        IEnumerable<TInterface> GetImplementations<TInterface>();
        IEnumerable<TInterface> GetImplementations<TInterface>(object[] parameters);
        TInterface GetImplementation<TInterface>();
        TInterface GetImplementation<TInterface>(object[] parameters);
        PluginWorker<T, T1> CreateWorker<T, T1>();
    }
}
