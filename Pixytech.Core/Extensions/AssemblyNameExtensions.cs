using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Pixytech.Core.Extensions
{
    public static class AssemblyNameExtensions
    {
        public static IEnumerable<AssemblyName> DistinctAssemblyNames(this IEnumerable<AssemblyName> source)
        {
            var distinctAssemblies = from p in source
                                     group p by new { p.FullName }
                                         into mygroup
                                         select mygroup.FirstOrDefault();
            return distinctAssemblies;
        }

        public static IEnumerable<Assembly> ToAssemblies(this IEnumerable<AssemblyName> source)
        {
            var assemblies = new List<Assembly>();
            foreach (var name in source)
            {
                assemblies.Add(Assembly.Load(name));
            }
            return assemblies;
        }

        public static IEnumerable<AssemblyName> FilterAssemblies(this IEnumerable<AssemblyName> source, string startWithFilter)
        {
            var filtered = from p in source
                where p.FullName.StartsWith(startWithFilter)
                select p;
            return filtered.ToList();
        }

        
    }
}
