using System;
using System.Collections.Generic;
using System.Reflection;

namespace Pixytech.Core.Discovery
{
    public interface IAssemblyScanner : IDisposable
    {
        IEnumerable<AssemblyName> ScanForImplementation<TInterface>(IEnumerable<AssemblyName> assemblyNames);

        IEnumerable<AssemblyName> ScanForAttribute<TAttribute>(IEnumerable<AssemblyName> assemblyNames);
    }
}
