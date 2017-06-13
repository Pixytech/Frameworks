using System;
using System.Runtime.Remoting.Lifetime;

namespace Pixytech.Core.Isolation
{
    public interface IObjectSponsor<out TInterface> : ISponsor, IDisposable where TInterface : class
    {
        TInterface Instance { get; }
        bool IsDisposed { get; }
    }
}
