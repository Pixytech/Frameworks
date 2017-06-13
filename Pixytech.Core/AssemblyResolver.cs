using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using Pixytech.Core.Logging;
using Pixytech.Core.Extensions;
namespace Pixytech.Core
{
    /// <summary>
    /// This class is reponsible to resolve the reference from local respository and move the costura resolvers on 2nd priority list if they exists
    /// </summary>
    internal class AssemblyResolver : IAssemblyResolver
    {
        private readonly List<AssemblyName> _libAssemblies;
        private ILog _logger;
        private readonly string _rootPath;
        private bool _isAttached;
        private readonly object _syncLock = new object();
        private readonly IEnumerable<AssemblyName> _PixytechAssemblies;
        public AssemblyResolver()
        {
            lock (_syncLock)
            {
                _rootPath = BuildRootPath();
                _libAssemblies = new List<AssemblyName>(GetAssemblies(_rootPath));
                _PixytechAssemblies = _libAssemblies.FilterAssemblies("Pixytech.").ToList();
            }
        }

        /// <summary>
        /// When any assembly loaded and it contains the Costura assembly loader ( incase of raven and nservice bus), we have to move the costura resolver to bottom of the chain
        /// so that we got preference to resolve the assembly based on type and version fro our local resp.If we are unable to find the assembly the original costura will get chance
        /// to resolve it.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="args"></param>
        private void CurrentDomain_AssemblyLoad(object sender, AssemblyLoadEventArgs args)
        {
            try
            {
                var assembly = args.LoadedAssembly;
                if (assembly != null)
                {
                    // check if assembly contains the costura type
                    var costuraType = assembly.GetType("Costura.AssemblyLoader");
                    if (costuraType != null)
                    {
                        // extract the costura handler and remove it from middle of chain
                        var resolverDelegate = ExtractCustraResolver(costuraType);
                        if (resolverDelegate != null)
                        {
                            AppDomain.CurrentDomain.AssemblyResolve -= resolverDelegate;
                        }
                        // Attach costura again so it get attached in the bottom
                        var attachMethod = costuraType.GetMethod("Attach");
                        attachMethod.Invoke(null, null);
                    }
                }
            }
            catch (Exception ex)
            {
                if (_isAttached)
                {
                    if (_logger != null)
                    {
                        (_logger).WarnFormat(
                            "Unable to move costura resolver in the chain for assembly {0}. Exception {1}",
                            args.LoadedAssembly, ex);
                    }
                }
            }
        }

        /// <summary>
        /// This will be called when an assembly containing Costura get loaded but its not attached at this stage
        /// </summary>
        /// <param name="costuraLoader"></param>
        /// <returns></returns>
        private static ResolveEventHandler ExtractCustraResolver(Type costuraLoader)
        {
            if (costuraLoader != null)
            {
                // force costura to attach the handler if exists
                ForceCustraHandlerAttach(costuraLoader);
                ResolveEventHandler costuraResolver;
                if (GetResolver(costuraLoader, out costuraResolver))
                {
                    return costuraResolver;
                }
            }

            return null;
        }
        private static void ForceCustraHandlerAttach(Type costuraLoader)
        {
            foreach (var propInfo in costuraLoader.GetFields(BindingFlags.NonPublic | BindingFlags.Static))
            {
                // this will attach the costura resolver and then our resolver too
                var rawHandler = propInfo.GetValue(null);
                break;
            }
        }

        private static bool GetResolver(Type costuraType, out ResolveEventHandler handler)
        {
                // start looking from bottom
                var list = GetResolvers(AppDomain.CurrentDomain).Reverse();

                // if handler is from same assembly then return the handler
                foreach (Delegate d in list)
                {
                    if (d.Target != null && d is ResolveEventHandler)
                    {
                        var targetType = d.Target.GetType();
                        if (targetType.DeclaringType == costuraType)
                        {
                            handler = (ResolveEventHandler)d;
                            return true;
                        }
                    }
                }
            handler = null;
            return false;
        }

        public static IEnumerable<Delegate> GetResolvers(AppDomain appDomain)
        {
            var assemblyResolveDelegateProperty = typeof(AppDomain).GetField("_AssemblyResolve", BindingFlags.GetField | BindingFlags.NonPublic | BindingFlags.Instance);

            var assemblyResolveDelegate = assemblyResolveDelegateProperty.GetValue(appDomain);

            var multicastDelegate = (MulticastDelegate)assemblyResolveDelegate;

            var list = multicastDelegate.GetInvocationList();

            return list;
        }

        private static string BuildRootPath()
        {
            var libCorePath = Path.GetDirectoryName(new Uri(typeof(IAssemblyResolver).Assembly.CodeBase).LocalPath);
            if (libCorePath == null)
            {
                throw new Exception("Unable to find the lib folder path");
            }

            var mainPath = Path.GetFullPath(Path.Combine(libCorePath, "../"));

            // Main path cann't be above appdomain path
            if (mainPath.Length < AppDomain.CurrentDomain.BaseDirectory.Length)
            {
                mainPath = AppDomain.CurrentDomain.BaseDirectory;
            }

            return mainPath;
        }

        public ILog Attach()
        {
            if (!_isAttached)
            {
                lock (_syncLock)
                {
                    _isAttached = true;
                    AppDomain.CurrentDomain.AssemblyResolve -= CoreAssemblyResolver;
                    AppDomain.CurrentDomain.AssemblyLoad -= CurrentDomain_AssemblyLoad;

                    AppDomain.CurrentDomain.AssemblyResolve +=CoreAssemblyResolver;
                    AppDomain.CurrentDomain.AssemblyLoad += CurrentDomain_AssemblyLoad;
                    _logger = LogManager.GetLogger(typeof(AssemblyResolver).Name);
                    
                }
            }
            return _logger;
        }

        
        public IEnumerable<AssemblyName> PixytechAssemblies { get { return _PixytechAssemblies; } }

        public IEnumerable<AssemblyName> AllAssemblies { get { return _libAssemblies; } }

        private Assembly GetAssembly(AssemblyName assemblyName)
        {
            foreach (var assemblyName2 in _libAssemblies)
            {
                if (assemblyName2.Name == assemblyName.Name)
                {
                    if (assemblyName.Version != null)
                    {
                        if (assemblyName2.Version == assemblyName.Version)
                        {
                            return Assembly.LoadFrom(new Uri(assemblyName2.CodeBase).LocalPath);
                        }
                    }
                    else
                    {
                        return Assembly.LoadFrom(new Uri(assemblyName2.CodeBase).LocalPath);
                    }
                }
            }

            return null;
        }

        private IEnumerable<AssemblyName> GetAssemblies(string libPath)
        {
            var assemblies = Directory.GetFiles(libPath, "*.dll", SearchOption.AllDirectories).Select(AssemblyName.GetAssemblyName);
            var distinctAssemblies = assemblies.DistinctAssemblyNames();
            return distinctAssemblies;
        }

        private Assembly CoreAssemblyResolver(object sender, ResolveEventArgs args)
        {
            var assemblyName = new AssemblyName(args.Name);
            var resolved = GetAssembly(assemblyName);
            
            if (_logger != null)
            {
                (_logger).DebugFormat(resolved != null ? "Resolved {0},{1}" : "Unresolved {0},{1}", assemblyName.Name,
                    assemblyName.Version);
            }

            return resolved;
        }

        public string GetRootPath()
        {
            return _rootPath;
        }

        public void AddCatalogDirectory(string directory)
        {
            _libAssemblies.AddRange(GetAssemblies(directory));
        }
    }
}
