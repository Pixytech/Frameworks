using System;
using Pixytech.Core.Isolation.Infrastructure;

namespace Pixytech.Core.Isolation.Activation
{
    [Serializable]
    class CurrentDomainHost : ActivationHost
    {

        public CurrentDomainHost(Action pluginUnloaded)
            : base(pluginUnloaded)
        {
        }
        
        /// <summary>
        /// Gets or sets the AppDomain into which the plug-ins are loaded.
        /// </summary>
        private AppDomain Domain { get; set; }

        protected override bool Connect(IPluginToken pipeline)
        {
            if (Domain == null)
            {
                Domain = AppDomain.CurrentDomain;
            }

            return true;
        }

        protected override IPluginLoader CreateLoader()
        {
            // instantiate PluginLoader in the other AppDomain
            var loader = (PluginLoader)Domain.CreateInstanceAndUnwrap(
                typeof(PluginLoader).Assembly.FullName,
                typeof(PluginLoader).FullName
            );
            return loader;
        }

        protected override bool Disconnect()
        {
            Domain = null;
            return true;
        }
    }
        
}
