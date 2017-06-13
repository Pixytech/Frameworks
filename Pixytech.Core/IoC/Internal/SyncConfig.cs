using System;

namespace Pixytech.Core.IoC.Internal
{
    /// <summary>
    /// Class for holding extension methods to NServiceBus.Configure
    /// </summary>
    public static class SyncConfig
    {
        private static bool _synchronize;
        private static bool _configured;
        /// <summary>
        /// Indicates whether the synchronization has been requested.
        /// </summary>
        public static bool Synchronize
        {
            get
            {
                return _synchronize;
            }
        }
        /// <summary>
        /// Notify that configuration of ConfigureCommon occurred.
        /// </summary>
        public static void MarkConfigured()
        {
            _configured = true;
        }
        /// <summary>
        /// Use this for multi-threaded rich clients. Specifies that message processing
        /// will occur within a synchronization domain (make sure that you only have one).
        /// </summary>
        public static ObjectFactory Synchronization(this ObjectFactory config)
        {
            if (_configured)
            {
                throw new InvalidOperationException("Synchronization() can only be called before any object builders.");
            }
            _synchronize = true;
            return config;
        }
    }
}
