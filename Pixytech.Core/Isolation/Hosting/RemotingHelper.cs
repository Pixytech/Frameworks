using System;
using System.Collections;
using System.Runtime.Remoting.Channels;
using System.Runtime.Serialization.Formatters;
using System.Security;
using System.Security.Permissions;
using Pixytech.Core.Isolation.Remoting;

namespace Pixytech.Core.Isolation.Hosting
{
    internal static class RemotingHelper
    {
        private static bool _createdInAd;
        private static readonly object SLock = new object();
        internal static readonly string SEmptyGuid = Guid.Empty.ToString();

        [SecuritySafeCritical]
        [SecurityPermission(SecurityAction.Assert, Flags = (SecurityPermissionFlag.RemotingConfiguration | SecurityPermissionFlag.Infrastructure))]
        internal static void InitializeClientChannel()
        {
            lock (SLock)
            {
                if (!_createdInAd)
                {
                    _createdInAd = true;
                    var binaryServerFormatterSinkProvider = new BinaryServerFormatterSinkProvider
                    {
                        TypeFilterLevel = TypeFilterLevel.Full
                    };
                    var client = new BinaryClientFormatterSinkProvider();
                    IDictionary dictionary = new Hashtable();
                    dictionary["name"] = "ClientChannel";
                    dictionary["portName"] = Guid.NewGuid().ToString();
                    dictionary["typeFilterLevel"] = "Full";
                    IChannel chnl = new PluginIpcChannel(dictionary, client, binaryServerFormatterSinkProvider);
                    ChannelServices.RegisterChannel(chnl, false);
                }
            }
        }

        [SecuritySafeCritical]
        internal static PluginServer GetPluginServer(string guid)
        {
            var type = typeof (PluginServer); //Type.GetType("Pixytech.Dashboard.Plugins.Hosting.PluginServer");

            if (type == null)
            {
                throw new InvalidOperationException("Unable to find PluginServer type from Pixytech.Dashboard.Plugins.Hosting.PluginServer");
            }

            return (PluginServer)Activator.GetObject(type, "ipc://" + guid + "/PluginServer");
        }
    }
}
