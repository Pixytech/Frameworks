using System;
using System.Runtime.Remoting;
using System.Runtime.Remoting.Lifetime;
using System.Security.Permissions;

namespace Pixytech.Core.Isolation
{
    /// <summary>
    /// Wraps an instance of TInterface. If the instance is a 
    /// MarshalByRefObject, this class acts as a sponsor for its lifetime 
    /// service (until disposed/finalized). Disposing the sponsor implicitly 
    /// disposes the instance.
    /// </summary>
    /// <typeparam name="TInterface"></typeparam>
    [Serializable]
    [SecurityPermission(SecurityAction.Demand, Infrastructure = true)]
    public class Sponsor<TInterface> : IObjectSponsor<TInterface> where TInterface : class
    {

        private TInterface _mInstance;

        //internal IActivationHost ActivationHost;

        /// <summary>
        /// Gets the wrapped instance of TInterface.
        /// </summary>
        public TInterface Instance
        {
            get
            {
                if (IsDisposed)
                    throw new ObjectDisposedException("Instance");
                return _mInstance;
            }
            private set
            {
                _mInstance = value;
            }
        }

        /// <summary>
        /// Gets whether the sponsor has been disposed.
        /// </summary>
        public bool IsDisposed { get; private set; }

        /// <summary>
        /// Initialises a new instance of the Sponsor&lt;TInterface&gt; class, 
        /// wrapping the specified object instance.
        /// </summary>
        internal Sponsor(TInterface instance)
        {
            Instance = instance;

            var o = Instance as MarshalByRefObject;
            if (o != null)
            {
                object lifetimeService = RemotingServices.GetLifetimeService((MarshalByRefObject)(object)Instance);
                var service = lifetimeService as ILease;
                if (service != null)
                {
                    var lease = service;
                    lease.Register(this, TimeSpan.FromSeconds(2));
                }
            }
        }

        /// <summary>
        /// Finaliser.
        /// </summary>
        ~Sponsor()
        {
            Dispose(false);
        }

        /// <summary>
        /// Disposes the sponsor and the instance it wraps.
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Disposes the sponsor and the instance it wraps.
        /// </summary>
        /// <param name="disposing"></param>
        protected virtual void Dispose(bool disposing)
        {
            if (!IsDisposed)
            {
                if (disposing)
                {
                    var o = Instance as MarshalByRefObject;
                    if (o != null)
                    {
                        object lifetimeService = RemotingServices.GetLifetimeService((MarshalByRefObject)(object)Instance);
                        var service = lifetimeService as ILease;
                        if (service != null)
                        {
                            var lease = service;
                            lease.Unregister(this);
                        }
                    }

                    var instance = Instance as IDisposable;
                    try
                    {
                        if (instance != null)
                            instance.Dispose();
                    }catch{}

                }
                Instance = null;
                IsDisposed = true;
            }
        }

        /// <summary>
        /// Renews the lease on the instance as though it has been called normally.
        /// </summary>
        /// <param name="lease"></param>
        /// <returns></returns>
        TimeSpan ISponsor.Renewal(ILease lease)
        {
            return IsDisposed ? TimeSpan.Zero : LifetimeServices.RenewOnCallTime;
        }
    }
}
