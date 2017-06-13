using System;
using System.Diagnostics;
using System.Threading;
using System.Windows.Threading;
using Demo.Helpers;
using Demo.Installer;
using Demo.ViewModels;
using Demo.Views;
using Pixytech.Core.Logging;
using Pixytech.Desktop.Presentation.Infrastructure;
using Demo.Presentation.Infrastructure;
using Pixytech.Core.IoC;

namespace Demo
{
    internal class ProgramAppEntry 
    {
        private readonly ILog _logger = LogManager.GetLogger(typeof(ProgramAppEntry));
        private readonly ManualResetEvent _splashCreatedEvent;
        private readonly Stopwatch _splashWatch;
        private readonly ISplash _splashViewModel;
        
        public ProgramAppEntry(IAppDeployment appDeployment, SplashViewModel splashViewModel)
        {
            _splashViewModel = splashViewModel;
            _splashCreatedEvent = new ManualResetEvent(false);
            _splashWatch = new Stopwatch();
            var dispatcher = CreateSplashScreen(splashViewModel);

            splashViewModel.OnShutDown(() =>
            {
                _splashWatch.Stop();
                dispatcher.BeginInvokeShutdown(DispatcherPriority.Send);
            });

            _splashViewModel.Message = "Initializing Dependencies.. ";

            ObjectFactory.Configure(c =>
            {
                c.ConfigureType(() => splashViewModel, ObjectLifecycle.SingleInstance);
                c.ConfigureType(() => appDeployment, ObjectLifecycle.SingleInstance);
                c.ConfigureType<ProgramProcessor>(ObjectLifecycle.SingleInstance);
                c.ConfigureType<InstanceController>(ObjectLifecycle.SingleInstance);
                c.ConfigureType<ClickOnceInstaller>(ObjectLifecycle.SingleInstance);
                //c.ConfigureType<ComInstaller>(ObjectLifecycle.SingleInstance);
                c.ConfigureType<CustomProtocolInstaller>(ObjectLifecycle.SingleInstance);
                c.ConfigureType<PlatformInstalManager>(ObjectLifecycle.InstancePerCall);
                c.ConfigureType<CommandBuilder>(ObjectLifecycle.InstancePerCall);
                c.ConfigureType<App>(ObjectLifecycle.SingleInstance);
                c.ConfigureType<Bootstrapper>(ObjectLifecycle.SingleInstance);
            });
        }

        private Dispatcher CreateSplashScreen(ISplash splashViewModel)
        {
            _logger.InfoFormat("Creating splash screen under dedicated STA thread");
            var splashThread = new Thread(CreateThreadedSplashScreen);
            splashThread.SetApartmentState(ApartmentState.STA);
            splashThread.IsBackground = true;
            splashThread.Start(splashViewModel);
            _splashCreatedEvent.WaitOne();
            return Dispatcher.FromThread(splashThread);
        }

        private void CreateThreadedSplashScreen(object viewModel)
        {
            var window = new Splash { DataContext = viewModel };
            window.Loaded += ((s, e) => _splashCreatedEvent.Set());
            window.Topmost = true;
            window.Show();
            _splashWatch.Start();
            Dispatcher.Run();
        }

        public int Start(string[] arguments)
        {
            _splashViewModel.Message = "Starting...";
            var processor = ObjectFactory.Builder.Build<ProgramProcessor>();
            processor.Process(arguments);
            _logger.InfoFormat("Application shutting down");
            return Environment.ExitCode;
        }
    }
}
