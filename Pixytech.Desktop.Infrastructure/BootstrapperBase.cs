using System;
using Pixytech.Core.IoC;
using Pixytech.Desktop.Presentation.Infrastructure.Modulatiry;
using Pixytech.Desktop.Presentation.Infrastructure.Properties;
using Microsoft.Practices.Prism;
using Microsoft.Practices.Prism.Logging;
using Microsoft.Practices.Prism.Modularity;
using Microsoft.Practices.Prism.Regions;
using Microsoft.Practices.ServiceLocation;
using Microsoft.Practices.Prism.Regions.Behaviors;
using Microsoft.Practices.Prism.PubSubEvents;

namespace Pixytech.Desktop.Presentation.Infrastructure
{
    public abstract class BootstrapperBase : Bootstrapper
    {
        private bool _useDefaultConfiguration = true;
        private readonly ISplash _splashViewModel;

        protected BootstrapperBase(ISplash splashViewModel)
        {
            _splashViewModel = splashViewModel;
            Builder = ObjectFactory.Builder;
        }

        protected IContainer Container
        {
            get;
            private set;
        }
        private IBuilder Builder
        {
            get;
            set;
        }

        public override void Run(bool runWithDefaultConfiguration)
        {
            _useDefaultConfiguration = runWithDefaultConfiguration;

            _splashViewModel.Message = "Configuring logging...";
            Logger = CreateLogger();

            if (Logger == null)
            {
                throw new InvalidOperationException(Resource.NullLoggerFacadeException);
            }

            Logger.Log(Resource.LoggerCreatedSuccessfully, Category.Debug, Priority.Low);

            Logger.Log(Resource.CreatingModuleCatalog, Category.Debug, Priority.Low);

            _splashViewModel.Message = "Configuring module collection...";

            ModuleCatalog = (CreateModuleCatalog());

            if (ModuleCatalog == null)
            {
                throw new InvalidOperationException(Resource.NullModuleCatalogException);
            }

            Logger.Log(Resource.ConfiguringModuleCatalog, Category.Debug, Priority.Low);

            ConfigureModuleCatalog();

            _splashViewModel.Message = "Configuring object container...";

            Logger.Log(Resource.ConfiguringAutofacContainer, Category.Debug, Priority.Low);

            ConfigureContainer();

            Logger.Log(Resource.CreatingAutofacContainer, Category.Debug, Priority.Low);

            Container = CreateContainer();

            if (Container == null)
            {
                throw new InvalidOperationException(Resource.NullAutofacContainerException);
            }

            Logger.Log(Resource.ConfiguringServiceLocatorSingleton, Category.Debug, Priority.Low);

            _splashViewModel.Message = "Configuring service locator...";

            ConfigureServiceLocator();

            Logger.Log(Resource.ConfiguringRegionAdapters, Category.Debug, Priority.Low);

            _splashViewModel.Message = "Configuring region adaptors...";

            ConfigureRegionAdapterMappings();

            Logger.Log(Resource.ConfiguringDefaultRegionBehaviors, Category.Debug, Priority.Low);

            ConfigureDefaultRegionBehaviors();

            Logger.Log(Resource.RegisteringFrameworkExceptionTypes, Category.Debug, Priority.Low);

            _splashViewModel.Message = "Configuring exceptions...";

            RegisterFrameworkExceptionTypes();

            Logger.Log(Resource.CreatingShell, Category.Debug, Priority.Low);

            _splashViewModel.Message = "Creating dashboard view...";

            Shell = CreateShell();

            if (Shell != null)
            {
                Logger.Log(Resource.SettingTheRegionManager, Category.Debug, Priority.Low);

                _splashViewModel.Message = "Few more seconds...";

                RegionManager.SetRegionManager(Shell, Builder.Build<IRegionManager>());

                Logger.Log(Resource.UpdatingRegions, Category.Debug, Priority.Low);

                RegionManager.UpdateRegions();

                Logger.Log(Resource.InitializingShell, Category.Debug, Priority.Low);

                InitializeShell();
            }
            if (Container.HasComponent<IModuleManager>())
            {
                Logger.Log(Resource.InitializingModules, Category.Debug, Priority.Low);

                _splashViewModel.Message = "Initializing modules...";
                InitializeModules();
            }
            Logger.Log(Resource.BootstrapperSequenceCompleted, Category.Debug, Priority.Low);
        }

        protected override void RegisterFrameworkExceptionTypes()
        {
            base.RegisterFrameworkExceptionTypes();
            //ExceptionExtensions.RegisterFrameworkExceptionType(typeof(DependencyResolutionException));
        }

        protected override void InitializeModules()
        {
            var moduleManager = Container.Build<IModuleManager>();
            moduleManager.Run();
        }

        protected virtual IContainer CreateContainer()
        {
            return ObjectFactory.Container;
        }

        protected virtual void ConfigureContainer()
        {
            Logger.Log(Resource.AddingAutofacBootstrapperExtensionToContainer, Category.Debug, Priority.Low);

            ObjectFactory.Configure(c =>
            {
                c.RegisterSingleton<ILoggerFacade>(Logger);
                c.RegisterSingleton<IModuleCatalog>(ModuleCatalog);
            });

            if (_useDefaultConfiguration)
            {
                ObjectFactory.Configure(c =>
                {
                    c.ConfigureType<IServiceLocator>(t => new ServiceLocator(ObjectFactory.Container), ObjectLifecycle.SingleInstance);
                    c.RegisterSingleton<ISplash>(_splashViewModel);
                    c.ConfigureType<Microsoft.Practices.Prism.Modularity.ModuleInitializer>(ObjectLifecycle.SingleInstance);
                    c.ConfigureType<ModuleManagerEx>(ObjectLifecycle.SingleInstance);
                    c.ConfigureType<RegionAdapterMappings>(ObjectLifecycle.SingleInstance);
                    c.ConfigureType<RegionManager>(ObjectLifecycle.SingleInstance);

                    c.ConfigureType<SelectorRegionAdapter>(ObjectLifecycle.SingleInstance);
                    c.ConfigureType<ItemsControlRegionAdapter>(ObjectLifecycle.SingleInstance);
                    c.ConfigureType<ContentControlRegionAdapter>(ObjectLifecycle.SingleInstance);

                    c.ConfigureType<DelayedRegionCreationBehavior>(ObjectLifecycle.InstancePerCall);
                    c.ConfigureType<BindRegionContextToDependencyObjectBehavior>(ObjectLifecycle.InstancePerCall);
                    c.ConfigureType<AutoPopulateRegionBehavior>(ObjectLifecycle.InstancePerCall);
                    c.ConfigureType<RegionActiveAwareBehavior>(ObjectLifecycle.InstancePerCall);
                    c.ConfigureType<SyncRegionContextWithHostBehavior>(ObjectLifecycle.InstancePerCall);

                    c.ConfigureType<RegionManagerRegistrationBehavior>(ObjectLifecycle.InstancePerCall);
                    c.ConfigureType<RegionMemberLifetimeBehavior>(ObjectLifecycle.InstancePerCall);
                    c.ConfigureType<ClearChildViewsRegionBehavior>(ObjectLifecycle.InstancePerCall);

                    c.ConfigureType<EventAggregator>(ObjectLifecycle.SingleInstance);
                    c.ConfigureType<RegionViewRegistry>(ObjectLifecycle.SingleInstance);
                    c.ConfigureType<RegionBehaviorFactory>(ObjectLifecycle.SingleInstance);

                    c.ConfigureType<RegionNavigationService>(ObjectLifecycle.InstancePerCall, false);

                    c.ConfigureType<RegionNavigationJournalEntry>(ObjectLifecycle.InstancePerCall,false);
                    c.ConfigureType<RegionNavigationJournal>(ObjectLifecycle.InstancePerCall, false);

                    c.ConfigureType<ExtendedRegionNavigationContentLoader>(ObjectLifecycle.SingleInstance);

                });
               
            }
        }
    
        protected override void ConfigureServiceLocator()
        {
            Microsoft.Practices.ServiceLocation.ServiceLocator.SetLocatorProvider(() => Container.Build<IServiceLocator>());
        }
    }
}
