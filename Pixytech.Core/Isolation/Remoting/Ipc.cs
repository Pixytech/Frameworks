using System;
using System.Collections;
using System.Runtime.Remoting;
using System.Runtime.Remoting.Channels;
using System.Runtime.Serialization.Formatters;
using System.Security;
using System.Threading;
using System.Threading.Tasks;


namespace Pixytech.Core.Isolation.Remoting
{
    public static class Ipc
    {
        public static IDisposable StartServer<TServiceType>(MarshalByRefObject instance, string rootName)
        {
            var binaryServerFormatterSinkProvider = new BinaryServerFormatterSinkProvider
            {
                TypeFilterLevel = TypeFilterLevel.Full
            };
            var client = new BinaryClientFormatterSinkProvider();

            IDictionary dictionary = new Hashtable();
            dictionary["name"] = string.Format("{0}.{1}", rootName, typeof (TServiceType).FullName);
            dictionary["portName"] = rootName;
            dictionary["typeFilterLevel"] = "Full";
            dictionary["exclusiveAddressUse"] = false;
            
            IChannel chnl = new PluginIpcChannel(dictionary, client, binaryServerFormatterSinkProvider);
            ChannelServices.RegisterChannel(chnl, false);
            RemotingServices.Marshal(instance, typeof (TServiceType).FullName);
            return new DisposableServer(chnl, instance);
        }

        [SecuritySafeCritical]
        public static TServiceType Connect<TServiceType>(string rootName)
        {
            var type = typeof(TServiceType);

            return (TServiceType)Activator.GetObject(type, string.Format("ipc://{0}/{1}", rootName, typeof(TServiceType).FullName));
        }

        [SecuritySafeCritical]
        public static Task<TServiceType> Connect<TServiceType>(string rootName, TimeSpan timeout,
            CancellationToken cancellationToken)
        {
            var task = new Task<TServiceType>(() =>
            {
                TServiceType serviceInstance = default(TServiceType);

                Task.Run(async () =>
                {
                    while (serviceInstance == null)
                    {
                        try
                        {
                            cancellationToken.ThrowIfCancellationRequested();

                            serviceInstance = Connect<TServiceType>(rootName);

                            await Task.Delay(TimeSpan.FromMilliseconds(100), cancellationToken);
                        }
                        catch
                        {
                        }
                    }
                }, cancellationToken).Wait(timeout);

                if (serviceInstance != null)
                {
                    return serviceInstance;
                }

                throw new TimeoutException();

            }, cancellationToken);

            return task;
        }

        [SecuritySafeCritical]
        public static TServiceType Connect<TServiceType>(string rootName, TimeSpan timeout)
        {
            var cts = new CancellationTokenSource(timeout);

            var task = Connect<TServiceType>(rootName, timeout, cts.Token);
            task.Start();
            task.Wait(cts.Token);
            return task.Result;
        }


        private class DisposableServer : IDisposable
        {
            private IChannel _channel;
            private bool _disposed;
            private MarshalByRefObject _instance;


            public DisposableServer(IChannel channel, MarshalByRefObject marsheled)
            {
                _channel = channel;
                _instance = marsheled;
            }


            public void Dispose()
            {
                Dispose(true);
                GC.SuppressFinalize(this);
            }

            // Use C# destructor syntax for finalization code.
            ~DisposableServer()
            {
                // Simply call Dispose(false).
                Dispose(false);
            }

            private void Dispose(bool disposing)
            {
                if (!_disposed)
                {
                    if (disposing)
                    {
                        try
                        {
                            RemotingServices.Disconnect(_instance);
                            _instance = null;
                        }
                        catch
                        {
                        }

                        try
                        {
                            ChannelServices.UnregisterChannel(_channel);
                            _channel = null;
                        }catch{}
                        // Free other state (managed objects).
                    }
                    // Free your own state (unmanaged objects).
                    // Set large fields to null.
                    _disposed = true;
                }
            }
        }

    }
}
