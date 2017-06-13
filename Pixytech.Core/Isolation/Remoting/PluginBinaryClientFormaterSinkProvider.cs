using System.Runtime.Remoting.Channels;
using System.Security;

namespace Pixytech.Core.Isolation.Remoting
{
    public class PluginBinaryClientFormaterSinkProvider : IClientChannelSinkProvider
    {
        private readonly IClientChannelSinkProvider _provider;
        public IClientChannelSinkProvider Next
        {
            [SecurityCritical]
            get
            {
                return _provider.Next;
            }
            [SecurityCritical]
            set
            {
                _provider.Next = value;
            }
        }

        public PluginBinaryClientFormaterSinkProvider(IClientChannelSinkProvider provider)
        {
            _provider = provider;
        }

        [SecurityCritical]
        public IClientChannelSink CreateSink(IChannelSender channel, string url, object remoteChannelData)
        {
            return new PluginBinaryClientFormaterSink(_provider.CreateSink(channel, url, remoteChannelData));
        }
    }
}
