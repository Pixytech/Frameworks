using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.Remoting;
using System.Security;
using System.Threading;
using Pixytech.Core.Isolation.Infrastructure;
using Pixytech.Core.Logging;

namespace Pixytech.Core.Isolation.Hosting
{
    internal sealed class PluginServer : MarshalByRefObject, IPluginServer
    {
        public event EventHandler ServerExit;
        private int _addInAppDomains;
        private volatile bool _startedExitProcess;
        private EventWorker _eventWorker;
        private readonly ILog _logger = LogManager.GetLogger(typeof(PluginServerWorker));
        private readonly List<AppDomain> _childAppDomain = new List<AppDomain>();
        private readonly object _syncLock = new object();
        public void Initialize(EventWorker eventWorker)
        {
            _eventWorker = eventWorker;
        }

        [SecuritySafeCritical]
        public PluginServerWorker CreateDomain(IPluginToken token, PermissionSet permissionSet)
        {
            Assembly assembly = typeof(PlugInActivator).Assembly;

            var appDomainSetup = ActivationHostFactory.CreateAppDomainSetup(token);
          
            var appDomain = AppDomain.CreateDomain(token.Name + token.Id, AppDomain.CurrentDomain.Evidence, appDomainSetup, permissionSet);//, new[]

            appDomain.Load(assembly.GetName());

            var objectHandle = Activator.CreateInstance(appDomain, assembly.FullName, typeof(PluginServerWorker).FullName);

            var addInServerWorker = (PluginServerWorker)objectHandle.Unwrap();

            addInServerWorker.PluginServer = this;

            lock (_syncLock)
            {
                _childAppDomain.Add(appDomain);
            }

            return addInServerWorker;
        }

        public void ExitProcess()
        {
            if (_childAppDomain.Any())
            {
                lock (_syncLock)
                {
                    _childAppDomain.ForEach(domain =>
                    {
                        try
                        {
                            AppDomain.Unload(domain);
                        }
// ReSharper disable once EmptyGeneralCatchClause
                        catch
                        {
                        }
                    });
                    _childAppDomain.Clear();
                }
                GC.Collect();
                GC.WaitForPendingFinalizers();
                GC.Collect();
                GC.WaitForPendingFinalizers();
            }

            _startedExitProcess = true;
            if (ServerExit != null)
            {
                ServerExit(this, EventArgs.Empty);
            }
            else
            {
                Environment.Exit(0);
            }
        }

        public void AddInDomainFinalized()
        {
            long num = Interlocked.Decrement(ref _addInAppDomains);

            if (!_startedExitProcess && num == 0L)
            {
                try
                {
                    _eventWorker.SendShutdownMessage();
                }
                catch (RemotingException)
                {
                }
            }
        }

        public override object InitializeLifetimeService()
        {
            return null;
        }

        //public void AttachToDebugger(int parentProcessId)
        //{
        //    try
        //    {
        //        if (!Debugger.IsAttached)
        //        {
        //            VsDebugger.AttachCurrentWithDebugger(parentProcessId);

        //            _logger.Debug(@"Attached to visual studio debugger");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.DebugFormat(@"Error while attaching to visual studio : {0} ", ex.Message);
        //    }

        //}
    }
}
