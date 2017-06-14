using System;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Windows;
using Pixytech.Core.IoC;
using Pixytech.Core.Logging;
using Demo.Modules;
using Demo.ViewModels;
using Microsoft.VisualBasic.ApplicationServices;
using StartupEventArgs = Microsoft.VisualBasic.ApplicationServices.StartupEventArgs;

namespace Demo.Helpers
{
    internal class InstanceController : WindowsFormsApplicationBase
    {
        private readonly ILog _logger = LogManager.GetLogger(typeof(InstanceController));
        private readonly App _application;
        private readonly Stopwatch _splashWatch;
        private readonly TimeSpan _splashMinTimeWait = TimeSpan.FromSeconds(1);
        private readonly SplashViewModel _splashViewModel;
        
        public string Query { get; private set; }
        
        public InstanceController(SplashViewModel splashViewModel, App app)
        {
            IsSingleInstance = true;
            _splashViewModel = splashViewModel;
            _splashViewModel.Message = "Checking existing instance..";
            _application = app;
            _splashWatch = new Stopwatch();
            _splashWatch.Start();
        }

        protected override void OnStartupNextInstance(StartupNextInstanceEventArgs eventArgs)
        {
            if (!_application.RestartRequired())
            {
                _splashViewModel.Message = "Activating already running instance..";
                _application.ActivateApp();
                _application.ProcessCommand(eventArgs.CommandLine.ToArray());
            }
            else
            {
                _splashViewModel.Message = "Restart is pending for new instance..";
                Query = eventArgs.CommandLine[0];
                IsRestartRequied = true;
                Environment.Exit(1);
            }
        }

        protected override void OnRun()
        {
            _splashViewModel.Message = "Downloading modules ...";
            var builder = ObjectFactory.Builder.Build<IRemoteModuleManager>();
            builder.DownloadModules(OnFinishedDownload);
            // we dont have remote module as o now
            OnFinishedDownload(null);
            _application.Run();
        }

        private void OnFinishedDownload(Exception exception)
        {
            _splashViewModel.Message = "Launching demo app...";

            WaitForMinimumTime();

            if (exception == null)
            {
                _application.MainWindow.Show();
                _splashViewModel.ShutDown();

                _application.MainWindow.Topmost = true;
                _application.MainWindow.Activate();

                _application.MainWindow.Topmost = false;
            }
            else
            {
                _splashViewModel.ShutDown();

                _logger.ErrorFormat(string.Format("The service is unavailable.{0}", exception.Message));
                MessageBox.Show(string.Format("The service is unavailable.{0}", exception.Message), "We're Sorry.", MessageBoxButton.OK, MessageBoxImage.Error);
                _application.Shutdown(1);
            }
        }

        protected override void OnCreateSplashScreen()
        {
            _application.InitializeComponent();
            _splashViewModel.Message = "Initializing application..";
            base.OnCreateSplashScreen();
        }

        private void WaitForMinimumTime()
        {
            _splashWatch.Stop();
            var totalTimeSplan = _splashWatch.Elapsed;
            if (_splashMinTimeWait > totalTimeSplan)
            {
                var deltaTime = _splashMinTimeWait - totalTimeSplan;
                Thread.Sleep(deltaTime);
            }
        }

        protected override bool OnStartup(StartupEventArgs eventArgs)
        {
            if (IsDebugging)
            {
                _splashViewModel.Message = "Configuring app to use local modules..";
                _application.UseLocalModules = true;
            }
            _application.Start(eventArgs.CommandLine.ToArray());
            return true;
        }

        public bool IsRestartRequied { get; private set; }

        public bool IsDebugging { get; set; }
    }
}
