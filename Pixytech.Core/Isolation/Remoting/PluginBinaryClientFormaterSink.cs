using System.Collections;
using System.IO;
using System.Runtime.Remoting.Channels;
using System.Runtime.Remoting.Messaging;
using System.Security;
using System.Security.Permissions;

namespace Pixytech.Core.Isolation.Remoting
{
    public class PluginBinaryClientFormaterSink : IClientChannelSink, IMessageSink
    {
        private readonly IClientChannelSink _sink;
        private readonly IMessageSink _mSink;
        public IClientChannelSink NextChannelSink
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

        public IMessageSink NextSink
        {
            [SecurityCritical]
            get
            {
                return _mSink.NextSink;
            }
        }

        public PluginBinaryClientFormaterSink(IClientChannelSink sink)
        {
            _sink = sink;
            _mSink = (IMessageSink)sink;
        }

        [SecurityCritical]
        public void AsyncProcessRequest(IClientChannelSinkStack sinkStack, IMessage msg, ITransportHeaders headers, Stream stream)
        {
            _sink.AsyncProcessRequest(sinkStack, msg, headers, stream);
        }

        [SecurityCritical]
        public void AsyncProcessResponse(IClientResponseChannelSinkStack sinkStack, object state, ITransportHeaders headers, Stream stream)
        {
            _sink.AsyncProcessResponse(sinkStack, state, headers, stream);
        }

        [SecurityCritical]
        public Stream GetRequestStream(IMessage msg, ITransportHeaders headers)
        {
            return _sink.GetRequestStream(msg, headers);
        }

        [SecurityCritical]
        public void ProcessMessage(IMessage msg, ITransportHeaders requestHeaders, Stream requestStream, out ITransportHeaders responseHeaders, out Stream responseStream)
        {
            _sink.ProcessMessage(msg, requestHeaders, requestStream, out responseHeaders, out responseStream);
        }

        [SecurityCritical]
        public IMessageCtrl AsyncProcessMessage(IMessage msg, IMessageSink replySink)
        {
            return _mSink.AsyncProcessMessage(msg, replySink);
        }

        [SecurityCritical]
        public IMessage SyncProcessMessage(IMessage msg)
        {
            new SecurityPermission(SecurityPermissionFlag.UnmanagedCode | SecurityPermissionFlag.SerializationFormatter).Assert();
            return _mSink.SyncProcessMessage(msg);
        }
    }
}
