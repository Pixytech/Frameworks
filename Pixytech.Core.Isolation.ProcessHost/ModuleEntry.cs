using System;

namespace Pixytech.Core.Isolation.ProcessHost
{
    public class ModuleEntry
    {
        [LoaderOptimization(LoaderOptimization.MultiDomainHost)]
        private static void Main(string[] args)
        {
            IAssemblyResolver resolver = AssemblyResolverFactory.CreateResolver();
            resolver.Attach();
            Program.Main(args);
        }
    }
}
