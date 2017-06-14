using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using Pixytech.Core.Logging;
using Demo.Helpers;
using Demo.Installer;
using Demo.ViewModels;
using Demo.Presentation.Infrastructure;

namespace Demo
{
    internal class ProgramProcessor
    {
        private readonly ILog _logger = LogManager.GetLogger(typeof(ProgramProcessor));
        private readonly InstanceController _instanceController;
        private readonly CommandBuilder _commandBuilder;
        private readonly PlatformInstalManager _platformInstalManager;
        private readonly IAppDeployment _appDeployment;
        private readonly SplashViewModel _splashViewModel;

        public ProgramProcessor(InstanceController instanceController, CommandBuilder commandBuilder, PlatformInstalManager platformInstalManager, IAppDeployment appDeployment, SplashViewModel splashViewModel)
        {
            _splashViewModel = splashViewModel;
            _appDeployment = appDeployment;
            _instanceController = instanceController;
            _commandBuilder = commandBuilder;
            _platformInstalManager = platformInstalManager;

        }

        public void Process(string[] arguments)
        {
            _splashViewModel.Message = "Processing request";
            var args = arguments.ToList();

            if (args.Count == 0)
            {
                args.Add("/query:?Launch=");
            }
            var commands = _commandBuilder.Build(args.ToList());

            _logger.InfoFormat("Commands parsed.. executing actions");

            ProcessCommands(commands);
        }

        private void ProcessCommands(IEnumerable<Command> commands)
        {
            var controller = _instanceController;
            var installManager = _platformInstalManager;

            foreach (var command in commands)
            {
                _splashViewModel.Message = string.Format("Executing action {0}", command.Action);
                
                //switch (command.Action)
                //{
                //    case "launch":
                        if (_appDeployment.IsNetworkDeployed)
                        {
                            _logger.InfoFormat("updating system info..");
                            installManager.Install(_appDeployment.UpdateLocation.ToString());
                        }

                        controller.Run(new[] { command.Argument });
                        break;

                    //case "debugvs":
                    //    _splashViewModel.Message = "checking debug arguments";
                    //    var argsNameValue = HttpUtility.ParseQueryString(command.Argument);
                    //    var args = argsNameValue.AllKeys.SelectMany(argsNameValue.GetValues, (k, v) => new { key = k, value = v });

                    //    var stringBuilder = new StringBuilder();
                    //    foreach (var arg in args)
                    //    {
                    //        stringBuilder.AppendFormat("/{0}:{1} ", arg.key, arg.value);
                    //    }

                    //    var argArray = stringBuilder.ToString().Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

                    //    if (CheckForDebugRequests(argArray))
                    //    {
                    //        controller.IsDebugging = true;
                    //        controller.Run(new[] { command.Argument });
                    //    }
                    //    break;
                //    case "uninstall":
                //        _splashViewModel.Message = "Removing Demo dashboard ..";
                //        installManager.UnInstall(command.Argument);
                //        DelayDeleteSelf();
                //        _splashViewModel.ShutDown();
                //        break;
                //}
            }
        }

        private void DelayDeleteSelf()
        {
            _splashViewModel.Message = "Removing application files..";
            using (var process = new Process())
            {
                process.StartInfo = new ProcessStartInfo("cmd")
                {
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    WindowStyle = ProcessWindowStyle.Hidden,
                    Arguments =
                        string.Format("/c \"timeout /t 4 & cd.. & rmdir /s /q \"{0}\" \"",
                            AppDomain.CurrentDomain.BaseDirectory)
                };
                process.Start();
                process.WaitForExit(300);
            }
        }

        private bool CheckForDebugRequests(string[] args)
        {

            if (args == null || !Environment.UserInteractive)
            {
                return false;
            }
            if (args.Length != 3)
            {
                return false;
            }
            if (!args[0].StartsWith("/name:", StringComparison.Ordinal) ||
                !args[1].StartsWith("/guid:", StringComparison.Ordinal) ||
                !args[2].StartsWith("/pid:", StringComparison.Ordinal))
            {
                return false;
            }

            // Name parameter is used to identify plugin host in task manager 
            // by looking at command line arguments

            string text = args[1].Remove(0, 6);
            if (text.Length != 36)
            {

            }

            _splashViewModel.Message = "Attaching debugger to shell..";
            
            int processId = Convert.ToInt32(args[2].Remove(0, 5), CultureInfo.InvariantCulture);

            DebuggerProcessId = processId;

            var debugger = new PluginDebugger(processId);

            debugger.TryAttachToDebugger();

            if (!Debugger.IsAttached)
            {
                Task.Run(() => { Thread.Sleep(200); debugger.TryAttachToDebugger(); });
            }

            return true;
        }
        public static int DebuggerProcessId { get; private set; }
    }
}
