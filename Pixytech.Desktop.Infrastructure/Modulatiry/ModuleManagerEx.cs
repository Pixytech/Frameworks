using System;
using System.Collections.Generic;
using Microsoft.Practices.Prism.PubSubEvents;
using Microsoft.Practices.Prism.Logging;
using Microsoft.Practices.Prism.Modularity;
using Microsoft.Practices.ServiceLocation;

namespace Pixytech.Desktop.Presentation.Infrastructure.Modulatiry
{
    public class ModuleManagerEx : ModuleManager
    {
        public ModuleManagerEx(IModuleInitializer moduleInitializer, IModuleCatalog moduleCatalog,
            ILoggerFacade loggerFacade, IEventAggregator eventAggregator, IServiceLocator serviceLocator)
            : base(moduleInitializer, moduleCatalog, loggerFacade)
        {
            _eventAggregator = eventAggregator;
            _serviceLocator = serviceLocator;
        }

        private IEnumerable<IModuleTypeLoader> _typeLoaders;
        private readonly IEventAggregator _eventAggregator;
        private IServiceLocator _serviceLocator;

        public override IEnumerable<IModuleTypeLoader> ModuleTypeLoaders
        {
            get
            {
                if (_typeLoaders == null)
                {
                    var typeLoaders = new List<IModuleTypeLoader>(base.ModuleTypeLoaders) { new XapModuleTypeLoader(_eventAggregator, _serviceLocator) };
                    _typeLoaders = typeLoaders;
                }

                return _typeLoaders;
            }
            set
            {
                var typeLoaders = new List<IModuleTypeLoader>(value) { new XapModuleTypeLoader(_eventAggregator, _serviceLocator) };
                _typeLoaders = typeLoaders;
            }
        }

        protected override bool ModuleNeedsRetrieval(ModuleInfo moduleInfo)
        {
            if (moduleInfo == null) throw new ArgumentNullException("moduleInfo");

            if (moduleInfo.State == ModuleState.NotStarted)
            {
                // If we can instantiate the type, that means the module's assembly is already loaded into 
                // the AppDomain and we don't need to retrieve it. 
                bool isAvailable = !string.IsNullOrEmpty(moduleInfo.ModuleType) && Type.GetType(moduleInfo.ModuleType) != null;
                if (isAvailable)
                {
                    moduleInfo.State = ModuleState.ReadyForInitialization;
                }

                return !isAvailable;
            }

            return false;
        }

      
    }
}
