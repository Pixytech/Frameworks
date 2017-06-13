using System.Collections;
using System.Runtime.Remoting.Channels;
using System.Runtime.Remoting.Channels.Ipc;
using System.Security;

namespace Pixytech.Core.Isolation.Remoting
{
    public class PluginIpcChannel : IpcChannel
    {
        [SecurityCritical]
        public PluginIpcChannel(IDictionary props, IClientChannelSinkProvider client, IServerChannelSinkProvider server)
            : base(props, new PluginBinaryClientFormaterSinkProvider(client), new PluginBinaryServerFormaterSinkProvider(server))
        {
        }
    }
}
