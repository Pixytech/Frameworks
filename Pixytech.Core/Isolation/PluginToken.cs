using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Security;
using System.Security.Permissions;

namespace Pixytech.Core.Isolation
{
    [Serializable]
    public class PluginToken : IPluginToken
    {
        public delegate IPluginToken Factory(string name, string location, Guid contextId);
        
        private readonly List<AssemblyName> _assemblyCache;

        public PluginToken() : this(Path.GetFileNameWithoutExtension(Path.GetRandomFileName()),AppDomain.CurrentDomain.BaseDirectory,Guid.NewGuid())
        {

        }

        public PluginToken(string name, string location)
            : this(name, location, Guid.NewGuid())
        {
        }

        public PluginToken(string name, string location,Guid contextId) 
        {
            Name = name;
            Location = location;
            Id = Guid.NewGuid();
            ContextId = contextId;
            _assemblyCache = new List<AssemblyName>();
            PermissionSet = new PermissionSet(PermissionState.Unrestricted);
            var libFolder = Path.GetDirectoryName(new Uri(typeof(PluginToken).Assembly.CodeBase).LocalPath);

            if (libFolder == null)
            {
                throw new Exception("Unable to find the lib folder path");
            }

            var rootFolder = Path.GetFullPath(Path.Combine(libFolder, "../"));

            var libPath = new DirectoryInfo(libFolder).Name;

            PrivateBinPath = string.Format("{0};Components;", libPath);

            ConfigurationFile = Path.Combine(Location,Path.GetExtension(Name).Equals("config", StringComparison.OrdinalIgnoreCase)? Name : Name + ".config");

            ApplicationBase = rootFolder;

        }

        /// <summary>
        /// Gets the location of plugin
        /// </summary>
        public string Location { get; private set; }

        /// <summary>
        /// Gets or sets the list of directories under the application base directory that are probed for private assemblies.
        /// </summary>
        public string PrivateBinPath { get; set; }

        /// <summary>
        /// Unique Id for current domain
        /// </summary>
        public Guid Id { get; private set; }

        public IEnumerable<AssemblyName> AssemblyCache
        {
            get { return _assemblyCache; }
        }

        public void AddScanHint(AssemblyName assemblyName)
        {
            _assemblyCache.Add(assemblyName);
        }

        /// <summary>
        /// Gets or Sets the permission set for current domain
        /// </summary>
        public PermissionSet PermissionSet { get; set; }


        /// <summary>
        /// Friendly name for current appdomain
        /// </summary>
        public string Name { get; private set; }

        /// <summary>
        /// Gets or Sets the configuration file for current appdomain
        /// </summary>
        public string ConfigurationFile { get; set; }

        /// <summary>
        /// Unique context Id
        /// </summary>
        public Guid ContextId { get; private set; }

        /// <summary>
        /// Gets or Sets application base directory
        /// </summary>
        public string ApplicationBase { get; set; }
    }
}
