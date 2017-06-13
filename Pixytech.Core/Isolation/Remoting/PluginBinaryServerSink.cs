using System.Collections;
using System.IO;
using System.Runtime.Remoting.Channels;
using System.Runtime.Remoting.Messaging;
using System.Security;
using System.Security.Permissions;

namespace Pixytech.Core.Isolation.Remoting
{
    public class PluginBinaryServerSink : IServerChannelSink
    {
        private readonly IServerChannelSink _sink;
        public IServerChannelSink NextChannelSink
        {
            [SecurityCritical]
            get
            {
                return _sink.NextChannelSink;
            }
        }
        public IDictionary Properties
        {
            [SecurityCritical]
            get
            {
                return _sink.Properties;
            }
        }

        public PluginBinaryServerSink(IServerChannelSink sink)
        {
            _sink = sink;
        }

        [SecurityCritical]
        public void AsyncProcessResponse(IServerResponseChannelSinkStack sinkStack, object state, IMessage msg, ITransportHeaders headers, Stream stream)
        {
            _sink.AsyncProcessResponse(sinkStack, state, msg, headers, stream);
        }

        [SecurityCritical]
        public Stream GetResponseStream(IServerResponseChannelSinkStack sinkStack, object state, IMessage msg, ITransportHeaders headers)
        {
            return _sink.GetResponseStream(sinkStack, state, msg, headers);
        }

        [SecurityCritical]
        public ServerProcessing ProcessMessage(IServerChannelSinkStack sinkStack, IMessage requestMsg, ITransportHeaders requestHeaders, Stream requestStream, out IMessage responseMsg, out ITransportHeaders responseHeaders, out Stream responseStream)
        {
            new SecurityPermission(SecurityPermissionFlag.UnmanagedCode | SecurityPermissionFlag.SerializationFormatter).Assert();
            return _sink.ProcessMessage(sinkStack, requestMsg, requestHeaders, requestStream, out responseMsg, out responseHeaders, out responseStream);
        }
    }
}