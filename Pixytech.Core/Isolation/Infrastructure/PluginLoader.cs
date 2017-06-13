using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Security.Permissions;

namespace Pixytech.Core.Isolation.Infrastructure
{
    /// <summary>
    /// When hosted in a separate AppDomain, provides a mechanism for loading 
    /// plugin assemblies and instantiating objects within them.
    /// </summary>
    [SecurityPermission(SecurityAction.Demand, Infrastructure = true)]
    public sealed class PluginLoader : MarshalByRefObject, IPluginLoader
    {
        private Sponsor<TextWriter> _logger;

        /// <summary>
        /// Gets or sets the collection of assemblies that have been loaded.
        /// </summary>
        private List<Assembly> Assemblies { get; set; }
        /// <summary>
        /// Gets or sets the collection of constructors for various interface types.
        /// </summary>
        private Dictionary<Type, LinkedList<ConstructorInfo>> ConstructorCache { get; set; }
        /// <summary>
        /// Gets or sets the TextWriter to use for logging.
        /// </summary>
        public TextWriter Log
        {
            get
            {
                return (_logger != null) ? _logger.Instance : null;
            }
            set
            {
                _logger = (value != null) ? new Sponsor<TextWriter>(value) : null;
            }
        }

        /// <summary>
        /// Initialises a new instance of the PluginLoader class.
        /// </summary>
        public PluginLoader()
        {
            
            IAssemblyResolver resolver = AssemblyResolverFactory.CreateResolver();
            resolver.Attach();
            Log = TextWriter.Null;
            ConstructorCache = new Dictionary<Type, LinkedList<ConstructorInfo>>();
            Assemblies = new List<Assembly>();
        }

        /// <summary>
        /// Finalizer.
        /// </summary>
        ~PluginLoader()
        {
            Dispose(false);
        }

        public PluginWorker<T, T1> CreateWorker<T, T1>()
        {
            return new PluginWorker<T, T1>();
        }

        /// <summary>
        /// Loads plugin assemblies into the application domain and populates the collection of plugins.
        /// </summary>

        public void Init(IPluginToken pipeline)
        {
            Uninit();

            if (pipeline.AssemblyCache.Any())
            {
                foreach (var assemblyCache in pipeline.AssemblyCache)
                {
                    try
                    {
                        Assembly asm = Assembly.Load(assemblyCache);
                        Log.WriteLine("Loaded assembly {0}.", asm.GetName().Name);

                        // TODO: restrict assemblies loaded based on digital signature, 
                        // implementing a required interface, DRM, etc

                        Assemblies.Add(asm);
                    }
                    catch (ReflectionTypeLoadException rex)
                    {
                        Log.WriteLine("Plugin {0} failed to load.", assemblyCache);
                        foreach (Exception ex in rex.LoaderExceptions)
                        {
                            Log.WriteLine("\t{0}: {1}", ex.GetType().Name, ex.Message);
                        }
                    }
                    catch (BadImageFormatException)
                    {
                        // ignore, this simply means the DLL was not a .NET assembly
                        Log.WriteLine("Plugin {0} is not a valid assembly.", assemblyCache);
                    }
                    catch (Exception ex)
                    {
                        Log.WriteLine("Plugin {0} failed to load.", assemblyCache);
                        Log.WriteLine("\t{0}: {1}", ex.GetType().Name, ex.Message);
                    }
                }
            }
            else
            {

                foreach (string dllFile in Directory.GetFiles(pipeline.Location, "*.dll"))
                {
                    try
                    {
                        Assembly asm = Assembly.LoadFile(dllFile);
                        Log.WriteLine("Loaded assembly {0}.", asm.GetName().Name);

                        // TODO: restrict assemblies loaded based on digital signature, 
                        // implementing a required interface, DRM, etc

                        Assemblies.Add(asm);
                    }
                    catch (ReflectionTypeLoadException rex)
                    {
                        Log.WriteLine("Plugin {0} failed to load.", Path.GetFileName(dllFile));
                        foreach (Exception ex in rex.LoaderExceptions)
                        {
                            Log.WriteLine("\t{0}: {1}", ex.GetType().Name, ex.Message);
                        }
                    }
                    catch (BadImageFormatException)
                    {
                        // ignore, this simply means the DLL was not a .NET assembly
                        Log.WriteLine("Plugin {0} is not a valid assembly.", Path.GetFileName(dllFile));
                    }
                    catch (Exception ex)
                    {
                        Log.WriteLine("Plugin {0} failed to load.", Path.GetFileName(dllFile));
                        Log.WriteLine("\t{0}: {1}", ex.GetType().Name, ex.Message);
                    }
                }
            }
        }

        /// <summary>
        /// Clears all plugin assemblies and type info.
        /// </summary>
        public void Uninit()
        {
            Assemblies.Clear();
            ConstructorCache.Clear();
        }

        /// <summary>
        /// Returns a sequence of instances of types that implement a 
        /// particular interface. Any instances that are MarshalByRefObject 
        /// must be sponsored to prevent disconnection.
        /// </summary>
        /// <typeparam name="TInterface"></typeparam>
        /// <returns></returns>
        public IEnumerable<TInterface> GetImplementations<TInterface>(object[] parameters)
        {
            var instances = new LinkedList<TInterface>();

            foreach (ConstructorInfo constructor in GetConstructors<TInterface>())
            {
                instances.AddLast(CreateInstance<TInterface>(constructor, parameters));
            }

            return instances;
        }


        public IEnumerable<TInterface> GetImplementations<TInterface>()
        {
            return GetImplementations<TInterface>(null);
        }

        public TInterface GetImplementation<TInterface>()
        {
            return GetImplementation<TInterface>(null);
        }

        /// <summary>
        /// Returns the first implementation of a particular interface type. 
        /// Default implementations are not favoured.
        /// </summary>
        /// <typeparam name="TInterface"></typeparam>
        /// <returns></returns>
        public TInterface GetImplementation<TInterface>(object[] parameters)
        {
            foreach (ConstructorInfo constructor in GetConstructors<TInterface>())
            {
                // ToDo : Match the constructor with parameters
                return CreateInstance<TInterface>(constructor, parameters);
            }

            return default(TInterface);
        }

        /// <summary>
        /// Returns the constructors for implementations of a particular interface 
        /// type. Constructor info is cached after the initial crawl.
        /// </summary>
        /// <typeparam name="TInterface"></typeparam>
        /// <returns></returns>
        private IEnumerable<ConstructorInfo> GetConstructors<TInterface>()
        {
            if (ConstructorCache.ContainsKey(typeof (TInterface)))
            {
                return ConstructorCache[typeof (TInterface)];
            }
            var constructors = new LinkedList<ConstructorInfo>();


            foreach (Type type in GetMatchingTypes<TInterface>(Assemblies))
            {
                ConstructorInfo constructor = type.GetConstructor(Type.EmptyTypes);
                constructors.AddLast(constructor);
            }

            ConstructorCache[typeof (TInterface)] = constructors;
            return constructors;
        }


        private IEnumerable<Type> GetMatchingTypes<TInterface>(IEnumerable<Assembly> assemblies)
        {
            var result = new List<Type>();
            foreach (Assembly asm in assemblies)
            {
              result.AddRange( GetMatchingTypes<TInterface>(asm));
            }
            return result;

        }

        private  IEnumerable<Type>  GetMatchingTypes<TInterface>(Assembly asm)
        {
            var result = new List<Type>();

           
                foreach (Type type in asm.GetTypes())
                {
                    if (typeof(TInterface).IsAssignableFrom(type) && type.IsClass && !type.IsAbstract)
                    {
                        result.Add(type);    
                    }
                    //if (type.IsClass && !type.IsAbstract)
                    //{
                    //    if (type.GetInterfaces().Contains(typeof (TInterface)))
                    //    {
                    //        result.Add(type);
                    //    }
                    //}
                }
           

            return result;
        }

        /// <summary>
        /// Returns instances of all implementations of a particular interface 
        /// type in the specified assembly.
        /// </summary>
        private IEnumerable<TInterface> GetImplementations<TInterface>(Assembly assembly, object[] parameters)
        {
            var instances = new List<TInterface>();

            foreach (Type type in GetMatchingTypes<TInterface>(assembly))
            {
                ConstructorInfo constructor = type.GetConstructor(Type.EmptyTypes);
                var instance = CreateInstance<TInterface>(constructor, parameters);
                if (instance != null) instances.Add(instance);
            }

            return instances;
        }

        /// <summary>
        /// Invokes the specified constructor to create an instance of an 
        /// interface type.
        /// </summary>
        private TInterface CreateInstance<TInterface>(ConstructorInfo constructor, object[] parameters)
        {
            TInterface instance = default(TInterface);

            try
            {
                instance = (TInterface)constructor.Invoke(parameters);
            }
            catch (Exception ex)
            {
                Log.WriteLine(
                    "Unable to instantiate type {0} in plugin {1}",
                    constructor.ReflectedType.FullName,
                    Path.GetFileName(constructor.ReflectedType.Assembly.Location)
                );
                Log.WriteLine("\t{0}: {1}", ex.GetType().Name, ex.Message);
            }

            return instance;
        }

        /// <summary>
        /// Gets the first implementation of a particular interface type in 
        /// the specified assembly. Default implementations are not favoured.
        /// </summary>
        public TInterface GetImplementation<TInterface>(Assembly assembly, object[] parameters)
        {
            return GetImplementations<TInterface>(assembly,parameters).FirstOrDefault();
        }

        #region IDisposable Members

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        private void Dispose(bool disposing)
        {
            if (disposing)
            {
                Uninit();
                if (_logger != null) _logger.Dispose();
            }
        }

        #endregion


        public int ProcessId
        {
            get { return Process.GetCurrentProcess().Id; }
        }
    }
}
