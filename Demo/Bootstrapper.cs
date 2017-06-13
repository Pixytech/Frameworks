using System.Windows;
using Pixytech.Core;
using Pixytech.Core.IoC;
using Pixytech.Core.Logging;
using Demo.Modules;
using Demo.RegionAdaptors;
using Demo.Views;
using Demo.Presentation.Infrastructure;
using Pixytech.Desktop.Presentation.DependancyInjection;
using Pixytech.Desktop.Presentation.Infrastructure;
using Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces;
using Microsoft.Practices.Prism.Regions;
using Pixytech.Desktop.Presentation.AvalonDock;
using Microsoft.Practices.Prism.Regions.Behaviors;
using InfrastructureModule = Pixytech.Desktop.Presentation.Infrastructure.InfrastructureModule;

namespace Demo
{
    public class Bootstrapper : BootstrapperBase
    {
        private readonly ILog _logger = LogManager.GetLogger(typeof(Bootstrapper));
        private readonly ISplash _splashViewModel;
        private IMessageBoxService _messageBoxService;
        private readonly IAppDeployment _appDeployment;

        public Bootstrapper(ISplash splashViewModel, IAppDeployment appDeployment) : base(splashViewModel)
        {
            _splashViewModel = splashViewModel;
            _appDeployment = appDeployment;
        }

        protected override DependencyObject CreateShell()
        {
            _logger.InfoFormat("Creating shell..");
            _messageBoxService = Container.Build<IMessageBoxService>();
            
            var catalogBuilder = ObjectFactory.Builder.Build<IRemoteModuleManager>();

            if (UseLocalModules)
            {
                catalogBuilder.UseLocalModules = true;
            }

            var modulesInfos = catalogBuilder.Build();
            foreach (var moduleInfo in modulesInfos)
            {
                _logger.InfoFormat("Adding module catalog defination {0}", moduleInfo.ModuleName);
                ModuleCatalog.AddModule(moduleInfo);
            }

            _splashViewModel.Message = "Initializing dashboard...";

            var res = new Shell();

            return res;

        }

        protected override void ConfigureContainer()
        {
            _logger.InfoFormat("Configure Container");
            base.ConfigureContainer();

            _logger.InfoFormat("Configure local types");
            ObjectFactory.Configure(c =>
            {
                c.ConfigureType(() => _appDeployment, ObjectLifecycle.SingleInstance);
                c.ConfigureType<DockingManagerRegionAdapter>(ObjectLifecycle.InstancePerCall);
                c.ConfigureType(()=>_splashViewModel, ObjectLifecycle.SingleInstance);
                c.ConfigureType<DelayedRegionCreationBehavior>(ObjectLifecycle.SingleInstance);
            });

            _logger.InfoFormat("Configure moduless");

            ObjectFactory.AddModule<PresentationModule>();
            ObjectFactory.AddModule<InfrastructureModule>();
            ObjectFactory.AddModule<Demo.Presentation.PresentationModule>();
            ObjectFactory.AddModule<Demo.Presentation.Infrastructure.InfrastructureModule>();
            ObjectFactory.AddModule<CoreModule>();
            ObjectFactory.AddModule<DashboardModule>();

            _logger.InfoFormat("Configuration finished");
        }

        protected override RegionAdapterMappings ConfigureRegionAdapterMappings()
        {
            _logger.InfoFormat("Configuration RegionAdapterMappings");
            RegionAdapterMappings mappings = base.ConfigureRegionAdapterMappings();

            mappings.RegisterMapping(typeof(DockingManager), Container.Build<DockingManagerRegionAdapter>());
            return mappings;
            
        }
        
        protected override void InitializeShell()
        {
            _logger.InfoFormat("Initializing Shell");
            Application.Current.DispatcherUnhandledException += App_DispatcherUnhandledException;
            Application.Current.MainWindow = (Window) Shell;
            _splashViewModel.Message = "Launching dashboard...";
        }

        void App_DispatcherUnhandledException(object sender, System.Windows.Threading.DispatcherUnhandledExceptionEventArgs e)
        {
            _logger.ErrorFormat("App_DispatcherUnhandledException {0}", e.Exception);
            _messageBoxService.Show(e.Exception.Message, "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            e.Handled = true;
        }

        public bool UseLocalModules { get; set; }
    }
}
