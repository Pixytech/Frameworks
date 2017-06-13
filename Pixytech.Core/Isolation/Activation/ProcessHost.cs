using System;
using System.Security.Permissions;
using System.Threading;
using System.Threading.Tasks;
using Pixytech.Core.Isolation.Hosting;
using Pixytech.Core.Isolation.Infrastructure;
using Process = System.Diagnostics.Process;

namespace Pixytech.Core.Isolation.Activation
{
    [Serializable]
    [SecurityPermission(SecurityAction.LinkDemand, ControlAppDomain = true, Infrastructure = true)]
    class ProcessHost : ActivationHost
    {
        private readonly CancellationTokenSource _cancellationTokenSource;
        private IPluginToken _pipeline;

        public ProcessHost(Action pluginUnloaded)
            : base(pluginUnloaded)
        {
            _cancellationTokenSource = new CancellationTokenSource();
            
        }
        
        /// <summary>
        /// Gets or sets the AppDomain into which the plug-ins are loaded.
        /// </summary>
        private PluginProcess Domain { get; set; }

        protected override bool Connect(IPluginToken pipeline)
        {
            _pipeline = pipeline;
            if (Domain == null)
            {
                Domain = new PluginProcess(pipeline.Name);
                Domain.Start();
                Task.Run(() =>
                {
                    Process.GetProcessById(Domain.ProcessId).WaitForExit();
                    if (Domain != null && !_cancellationTokenSource.IsCancellationRequested)
                    {
                        UnloadDomain();
                    }
                }, _cancellationTokenSource.Token);
            }

            return true;
        }

        protected override IPluginLoader CreateLoader()

        {
            var server = Domain.GetPluginServer();

            //if (System.Diagnostics.Debugger.IsAttached)
            //{
            //    server.AttachToDebugger(Process.GetCurrentProcess().Id);
            //}

            var serverWorker = server.CreateDomain(Pipeline, _pipeline.PermissionSet);

            ActivationWorker activationWorker;
            
            var pluginLoader = serverWorker.Activate(Pipeline, out activationWorker);
            return pluginLoader;
        }

        protected override bool Disconnect()
        {
            if (Domain != null)
            {
                _cancellationTokenSource.Cancel(false);
                Domain.Dispose();
                Domain = null;
            }
            return true;
        }
    }
}
