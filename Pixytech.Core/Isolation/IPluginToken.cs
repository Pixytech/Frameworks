using System;
using System.Collections.Generic;
using System.Reflection;
using System.Security;

namespace Pixytech.Core.Isolation
{
    public interface IPluginToken
    {
        /// <summary>
        /// Gets the location of plugin
        /// </summary>
        string Location { get; }

        /// <summary>
        /// Friendly name for current appdomain
        /// </summary>
        string Name { get; }

        /// <summary>
        /// Gets or Sets the configuration file for current appdomain
        /// </summary>
        string ConfigurationFile { get; set; }

        /// <summary>
        /// Gets or sets the list of directories under the application base directory that are probed for private assemblies.
        /// </summary>
        string PrivateBinPath { get; set; }

        /// <summary>
        /// Unique Id for current domain
        /// </summary>
        Guid Id { get;}

        /// <summary>
        /// Gets or Sets the permission set for current domain
        /// </summary>
        PermissionSet PermissionSet { get; set; }

        /// <summary>
        /// Assembly scan hints
        /// </summary>
        IEnumerable<AssemblyName> AssemblyCache { get; }

        void AddScanHint(AssemblyName assemblyName);

        /// <summary>
        /// Unique context Id
        /// </summary>
        Guid ContextId { get; }

        /// <summary>
        /// Gets or Sets application base directory
        /// </summary>
        string ApplicationBase { get; set; }
    }
}
