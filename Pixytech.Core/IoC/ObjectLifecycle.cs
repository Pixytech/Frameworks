namespace Pixytech.Core.IoC
{
    /// <summary>
    /// Represent the various lifecycles available for components configured in the container.
    /// </summary>
    public enum ObjectLifecycle
    {
        /// <summary>
        /// The same instance will be returned each time
        /// </summary>
        SingleInstance,

        /// <summary>
        /// A new instance will be returned fro each call
        /// </summary>
        InstancePerCall,
        
        InstancePerLifetimeScope
    }
}
