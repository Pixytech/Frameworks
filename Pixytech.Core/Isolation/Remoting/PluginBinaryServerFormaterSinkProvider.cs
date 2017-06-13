using System.Runtime.Remoting.Channels;
using System.Security;

namespace Pixytech.Core.Isolation.Remoting
{
    public class PluginBinaryServerFormaterSinkProvider : IServerChannelSinkProvider
    {
        internal IServerChannelSinkProvider SinkProvider;

        public IServerChannelSinkProvider Next
        {
            [SecurityCritical]
            get
            {
                return SinkProvider.Next;
            }
            [SecurityCritical]
            set
            {
                SinkProvider.Next = value;
            }
        }

        public PluginBinaryServerFormaterSinkProvider(IServerChannelSinkProvider sink)
        {
            SinkProvider = sink;
        }

        [SecurityCritical]
        public IServerChannelSink CreateSink(IChannelReceiver channel)
        {
            return new PluginBinaryServerSink(SinkProvider.CreateSink(channel));
        }

        [SecurityCritical]
        public void GetChannelData(IChannelDataStore channelData)
        {
            SinkProvider.GetChannelData(channelData);
        }
    }
}
