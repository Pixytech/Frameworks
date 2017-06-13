using System;
using System.Collections;
using System.Diagnostics;
using System.Globalization;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Runtime.Remoting;
using System.Runtime.Remoting.Channels;
using System.Runtime.Serialization.Formatters;
using System.Threading;
using System.Threading.Tasks;
using Pixytech.Core.Isolation.Hosting;
using Pixytech.Core.Isolation.Remoting;

namespace Pixytech.Core.Isolation.ProcessHost
{
    class Program
    {
        [Flags]
        internal enum ErrorModes : uint
        {
            SystemDefault = 0x0,
            SemFailcriticalerrors = 0x0001,
            SemNoalignmentfaultexcept = 0x0004,
            SemNogpfaulterrorbox = 0x0002,
            SemNoopenfileerrorbox = 0x8000
        }

        private enum CtrlType
        {
            CtrlCEvent = 0,
            CtrlBreakEvent = 1,
            CtrlCloseEvent = 2,
            CtrlLogoffEvent = 5,
            CtrlShutdownEvent = 6
        }

        internal static class NativeMethods
        {
            [DllImport("kernel32.dll")]
            internal static extern ErrorModes SetErrorMode(ErrorModes mode);
        }

        [DllImport("user32.dll")]
        static extern int SetWindowText(IntPtr hWnd, string text);

        [DllImport("Kernel32")]
        private static extern bool SetConsoleCtrlHandler(EventHandler handler, bool add);

        private delegate bool EventHandler(CtrlType sig);
       
        public static int Main(string[] args)
        {
            NativeMethods.SetErrorMode(NativeMethods.SetErrorMode(0) |
                           ErrorModes.SemNogpfaulterrorbox |
                           ErrorModes.SemFailcriticalerrors |
                           ErrorModes.SemNoopenfileerrorbox);

            if (args == null)
            {
                return 1;
            }
            if (args.Length != 3)
            {
                return 1;
            }
            if (!args[0].StartsWith("/name:", StringComparison.Ordinal) || 
                !args[1].StartsWith("/guid:", StringComparison.Ordinal) || 
                !args[2].StartsWith("/pid:", StringComparison.Ordinal))
            {
                return 1;
            }

            // Name parameter is used to identify plugin host in task manager 
            // by looking at command line arguments
            
            string name = args[0].Remove(0, 6);

            if (Environment.UserInteractive)
            {
                SetWindowText(Process.GetCurrentProcess().MainWindowHandle, name);
            }

            string text = args[1].Remove(0, 6);
            if (text.Length != 36)
            {
                return 1;
            }

            int processId = Convert.ToInt32(args[2].Remove(0, 5), CultureInfo.InvariantCulture);

           
            Assembly assembly = typeof(Plugin).Assembly;
            Type type = assembly.GetType("Pixytech.Core.Isolation.Hosting.PluginServer", false);

            ConstructorInfo constructor = type.GetConstructor(BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic, null, new Type[0], null);
            var pluginServer = (IPluginServer) constructor.Invoke(BindingFlags.NonPublic, null, new object[0], null);

            var binaryServerFormatterSinkProvider = new BinaryServerFormatterSinkProvider
            {
                TypeFilterLevel = TypeFilterLevel.Full
            };
            var client = new BinaryClientFormatterSinkProvider();
            IDictionary dictionary = new Hashtable();
            dictionary["name"] = "ServerChannel";
            dictionary["portName"] = text;
            dictionary["typeFilterLevel"] = "Full";

            IChannel chnl = new PluginIpcChannel(dictionary, client, binaryServerFormatterSinkProvider);
            ChannelServices.RegisterChannel(chnl, false);
            RemotingServices.Marshal((MarshalByRefObject)pluginServer, "PluginServer");

            var eventWaitHandle = new EventWaitHandle(false, EventResetMode.ManualReset, "ProcessHost:" + text);
            eventWaitHandle.Set();
            eventWaitHandle.Close();
            var cancellationTokenSource = new CancellationTokenSource();
            pluginServer.ServerExit += (s, e) => cancellationTokenSource.Cancel(false);
            EventHandler handler = (sig =>
            {
                try
                {
                    var cleanupTask = new Task(() =>
                    {
                        if (pluginServer != null)
                        {
                            pluginServer.ExitProcess();
                        }

                        GC.Collect();
                        GC.WaitForPendingFinalizers();
                        Thread.Sleep(TimeSpan.FromSeconds(2));
                    });
                    cleanupTask.Start();
                    cleanupTask.Wait(TimeSpan.FromSeconds(20));
                }
// ReSharper disable once EmptyGeneralCatchClause
                catch
                {
                    
                }
                return true;
            });

            SetConsoleCtrlHandler(handler, true);
            var waitTask = new Task(() =>
            {
                try
                {

                    var process = Process.GetProcessById(processId);
                    while (!process.WaitForExit(2000))
                    {
                        if (cancellationTokenSource.IsCancellationRequested)
                        {
                            return;
                        }
                    }
                }
// ReSharper disable once EmptyGeneralCatchClause
                catch (Exception)
                {
                    
                }
            }, cancellationTokenSource.Token);
            
            waitTask.Start(TaskScheduler.Current);

            try
            {
                waitTask.Wait(cancellationTokenSource.Token);
            }
// ReSharper disable once EmptyGeneralCatchClause
            catch
            {
                
            }

            try
            {
                RemotingServices.Disconnect((MarshalByRefObject)pluginServer);
                ChannelServices.UnregisterChannel(chnl);
                pluginServer = null;
                chnl = null;
            }
// ReSharper disable once EmptyGeneralCatchClause
            catch
            {
                
            }

            GC.Collect();
            GC.WaitForPendingFinalizers();

            Environment.Exit(0);
            return 0;
        }
    }
}
