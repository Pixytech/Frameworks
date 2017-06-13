using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Pixytech.Core;
using Pixytech.Core.Extensions;
using Pixytech.Core.Isolation;

namespace Pixytech.Core.Discovery
{
    public class AssemblyScanner : MarshalByRefObject, IAssemblyScanner
    {
        public delegate IAssemblyScanner Factory();

        private AssemblyScanner _scanner;
        private bool _isInitilized;
        private IPlugin _host;
        
        private void Initialize()
        {
            if (_isInitilized) return;

            _isInitilized = true;

            var resolver = AssemblyResolverFactory.CreateResolver();
            resolver.Attach();

            var pipeline = new PluginToken(string.Empty, AppDomain.CurrentDomain.BaseDirectory, Guid.NewGuid());
            pipeline.AddScanHint(typeof(AssemblyScanner).Assembly.GetName());
            _host = new Plugin(pipeline).With(IsolationLevel.Medium);


            _scanner = (AssemblyScanner)_host.Create<IAssemblyScanner>();
        }

        public IEnumerable<AssemblyName> ScanForImplementation<TInterface>(IEnumerable<AssemblyName> assemblyNames)
        {
            Initialize();
            return _scanner.ScanForImplementationInsideDomain<TInterface>(assemblyNames.ToList()).DistinctAssemblyNames();
        }

        public IEnumerable<AssemblyName> ScanForAttribute<TAttribute>(IEnumerable<AssemblyName> assemblyNames)
        {
            Initialize();
            return _scanner.ScanForAttributeInsideDomain<TAttribute>(assemblyNames.ToList()).DistinctAssemblyNames();
        }

        private IEnumerable<AssemblyName> ScanForAttributeInsideDomain<TAttribute>(IEnumerable<AssemblyName> assemblyNames)
        {
            var discoveredAssemblyNames = new List<AssemblyName>();

            foreach (var assemblyName in assemblyNames)
            {
                Assembly assembly = null;
                try
                {
                    assembly = Assembly.Load(assemblyName);
                }
                catch { }
                finally
                {
                    if (assembly!= null && assembly.IsDefined(typeof (TAttribute), false))
                    {
                        discoveredAssemblyNames.Add(assembly.GetName());
                    }
                }

            }

            return discoveredAssemblyNames;
        }

        private IEnumerable<AssemblyName> ScanForImplementationInsideDomain<TInterface>(IEnumerable<AssemblyName> assemblyNames)
        {
            var discoveredAssemblyNames = new List<AssemblyName>();

            foreach (var assemblyName in assemblyNames)
            {
                Assembly assembly = null;
                try
                {
                    assembly = Assembly.Load(assemblyName);
                   
                }catch{}
                finally
                {
                    if (assembly != null && DoesImplement<TInterface>(assembly))
                    {
                        discoveredAssemblyNames.Add(assembly.GetName());
                    }
                }
            }

            return discoveredAssemblyNames;
        }

        private  bool DoesImplement<TInterface>(Assembly assembly)
        {
            foreach (var type in assembly.GetLoadableTypes())
            {
                if (type.IsClass && !type.IsAbstract && typeof(TInterface).IsAssignableFrom(type))
                {
                    return true;
                }
            }

            return false;
        }

       public void Dispose()
        {
            if (_scanner != null)
            {
                _scanner.Dispose();
                _host.Dispose();
                _scanner = null;
                _host = null;
            }
        }
    }
}
