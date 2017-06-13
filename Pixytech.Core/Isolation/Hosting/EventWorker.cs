using System;
using System.ComponentModel;

namespace Pixytech.Core.Isolation.Hosting
{
    internal sealed class EventWorker : MarshalByRefObject
    {
        private readonly PluginProcess _process;
        public bool SendShutdownMessage()
        {
            var cancelEventArgs = new CancelEventArgs();
            _process.SendShuttingDown(cancelEventArgs);
            return cancelEventArgs.Cancel;
        }

        public EventWorker(PluginProcess process)
        {
            _process = process;
        }
    }
}
