using System.Collections.Generic;
using System.Reflection;

namespace Pixytech.Core.Discovery
{
    public interface IAssembliesHost
    {
        IEnumerable<AssemblyName> GetAssemblies();
    }
}
