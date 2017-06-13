using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Runtime.Remoting;
using System.Runtime.Serialization;
using System.Security;
using System.Security.Permissions;
using System.Threading;

namespace Pixytech.Core.Isolation.Hosting
{
    /// <summary>Provides an external process for running add-ins out-of-process from the host application.</summary>
    public sealed class PluginProcess : IDisposable
    {
        private volatile Process _process;
		private Guid _guid;
		private readonly string _pathToPluginProcess;
        private readonly object _processLock;

		private TimeSpan _startupTimeout;
		
		/// <summary>Occurs when the process represented by the <see cref="T:Pixytech.Core.Isolation.Hosting.PluginProcess" /> object is about to be shut down.</summary>
		public event EventHandler<CancelEventArgs> ShuttingDown;
        private bool _isDisposed;
        private PluginServer _pluginServer;
        private readonly string _processIdentifier;
		/// <summary>Gets or sets the number of seconds to allow for the process to start.</summary>
		/// <returns>The number of seconds to allow for process startup.</returns>
		/// <exception cref="T:System.InvalidOperationException">The process is already running.</exception>
		/// <exception cref="T:System.ArgumentOutOfRangeException">The assigned value is less than 0 (zero).</exception>
		/// 
		public TimeSpan StartupTimeout
		{
			get
			{
				return _startupTimeout;
			}
			set
			{
				if (value.TotalSeconds < 0.0)
				{
					throw new ArgumentOutOfRangeException("value");
				}
				lock (_processLock)
				{
					if (_process != null)
					{
						throw new InvalidOperationException("The ProcessHost Process is Already Running");
					}
					_startupTimeout = value;
				}
			}
		}
		
		/// <summary>Gets the process ID of the external process.</summary>
		/// <returns>The process ID, or -1 if the external process has not started.</returns>
		public int ProcessId
		{
			[PermissionSet(SecurityAction.LinkDemand, Name = "FullTrust")]
			get
			{
				int result;
				lock (_processLock)
				{
					if (_process == null)
						{
							result = -1;
						}
						else
						{
							result = _process.Id;
						}
				}
				return result;
			}
		}

		internal Guid Guid
		{
			get
			{
				Start();
				return _guid;
			}
		}
       

        /// <summary>Initializes a new instance of the <see cref="T:System.AddIn.Hosting.PluginProcess" /> class. </summary>
		[PermissionSet(SecurityAction.Demand, Name = "FullTrust")]
		public PluginProcess(string Name)
        {
            _processIdentifier = Name;
            _processLock = new object();
			_startupTimeout = new TimeSpan(0, 0, 10);

            // this needs some refactoring
            string runtimeDirectory = GetProcessPluginPath();
			string processName = GetProcessName();
			_pathToPluginProcess = Path.Combine(runtimeDirectory, processName);
			if (!File.Exists(_pathToPluginProcess))
			{
				throw new InvalidOperationException(string.Format(CultureInfo.CurrentCulture, "The ProcessHost process is missing . Path {0}", new object[]
				{
					_pathToPluginProcess
				}));
			}
			RemotingHelper.InitializeClientChannel();
		}

        private string GetProcessPluginPath()
        {
            //var processHostObject = Activator.CreateInstance("Pixytech.Core.Isolation.ProcessHost", "Pixytech.Core.Isolation.ProcessHost.ModuleEntry").Unwrap();
            var type = GetType();// processHostObject.GetType();
            return Path.GetDirectoryName(new Uri(type.Assembly.CodeBase).LocalPath);
        }

        internal PluginServer GetPluginServer()
        {
            return _pluginServer ?? (_pluginServer = RemotingHelper.GetPluginServer(Guid.ToString()));
        }

        /// <summary>Starts the external process.</summary>
		/// <returns>true if the process is successfully started; false if the process is already running.</returns>
		[SecurityCritical]
		public bool Start()
		{
			if (_process == null)
			{
				lock (_processLock)
				{
					if (_process == null)
					{
						_process = CreatePluginProcess();
                        var pluginServer = GetPluginServer();
                        pluginServer.Initialize(new EventWorker(this));
					}
				}
				return true;
			}
			return false;
		}
		/// <summary>Forcibly shuts down the external process.</summary>
		/// <returns>true if the external process was running and is successfully shut down; false if there is no active process associated with the <see cref="T:System.AddIn.Hosting.PluginProcess" />.</returns>
		public bool Shutdown()
		{
			if (_process == null)
			{
				return false;
			}
			var cancelEventArgs = new CancelEventArgs();
			ShutDownUnlessCancelled(cancelEventArgs);
			return !cancelEventArgs.Cancel;
		}

	
		internal void SendShuttingDown(CancelEventArgs args)
		{
			ShutDownUnlessCancelled(args);
		}

		private void ShutDownUnlessCancelled(CancelEventArgs args)
		{
			if (ShuttingDown != null)
			{
				ShuttingDown(this, args);
			}
			if (args.Cancel)
			{
				return;
			}
			try
			{
				lock (_processLock)
				{
					PluginServer addInServer = GetPluginServer();
					addInServer.ExitProcess();
				    _pluginServer = null;
                    _process = null;
                    _guid = Guid.Empty;
				}
			}
			catch (RemotingException)
			{
			}
			catch (SerializationException)
			{
			}
		}
		[SecurityCritical]
		private static string GetProcessName()
		{
            return "Pixytech.Core.Isolation.ProcessHost.exe";
		}

		[SecurityCritical]
		private Process CreatePluginProcess()
		{
			var process = new Process();
			Guid guid = Guid.NewGuid();
			string arguments = string.Format(CultureInfo.InvariantCulture, "/name:{0} /guid:{1} /pid:{2}", new object[]
			{
                _processIdentifier,
				guid,
				Process.GetCurrentProcess().Id
			});
			process.StartInfo.CreateNoWindow = false;
			process.StartInfo.UseShellExecute = true;
			process.StartInfo.Arguments = arguments;
			process.StartInfo.FileName = _pathToPluginProcess;
			var eventWaitHandle = new EventWaitHandle(false, EventResetMode.ManualReset, "ProcessHost:" + guid);
			process.Start();
			bool flag = eventWaitHandle.WaitOne(_startupTimeout, false);
			eventWaitHandle.Close();
			if (!flag)
			{
				try
				{
					process.Kill();
				}
				catch
				{
				}
				throw new InvalidOperationException(string.Format(CultureInfo.CurrentCulture, "Could not create ProcessHost {0} within startup timeout of {1}", new object[]
				{
                    _pathToPluginProcess,
					_startupTimeout.ToString()
				}));
			}
			_guid = guid;
			return process;
		}

        ~PluginProcess()
        {
            Dispose(false); 
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        private void Dispose(bool disposing)
        {
            if (!_isDisposed)
            {
                if (disposing)
                {
                    Shutdown();
                }

                _isDisposed = true;
            }
        }
    }
}
