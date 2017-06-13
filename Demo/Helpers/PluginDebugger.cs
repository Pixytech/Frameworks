using System;
using System.Diagnostics;
using System.Threading;
using Pixytech.Core.Logging;

namespace Demo.Helpers
{
    public class PluginDebugger
    {
        private readonly int _parentProcessId;
        public delegate PluginDebugger Factory(int parentProcessId);
        ILog _logger = LogManager.GetLogger(typeof(PluginDebugger));

        public PluginDebugger(int parentProcessId)
        {
            _parentProcessId = parentProcessId;
        }

        [Conditional("DEBUG")]
        [DebuggerStepThrough]
        public void TryAttachToDebugger()
        {
            try
            {
                if (!Debugger.IsAttached)
                {
                  //  VsDebugger.AttachCurrentWithDebugger(_parentProcessId);
                    Thread.Sleep(500);
                    _logger.Debug(@"Attached to visual studio debugger");
                }
            }
            catch (Exception ex)
            {
                _logger.DebugFormat(@"Error while attaching to visual studio : {0} ", ex.Message);
            }

        }

        [Conditional("DEBUG")]
        [DebuggerStepThrough]
        public void Break()
        {
            if (Debugger.IsAttached)
            {
                Debugger.Break();
            }
        }
    }
}
