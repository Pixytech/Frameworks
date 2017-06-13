using Pixytech.Core.Logging;
using System;
using System.Collections.Generic;
using System.Reflection;

namespace Pixytech.Core
{
    public interface IAssemblyResolver
    {
        ILog Attach();

        String GetRootPath();

        void AddCatalogDirectory(String directory);

        IEnumerable<AssemblyName> PixytechAssemblies { get; }
        IEnumerable<AssemblyName> AllAssemblies { get; }
    }

    public static class AssemblyResolverFactory
    {
        static IAssemblyResolver _instance;

        public static IAssemblyResolver CreateResolver()
        {
            return _instance ?? (_instance = new AssemblyResolver());
        }
    }
}
