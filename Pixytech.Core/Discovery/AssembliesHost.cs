using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;

namespace Pixytech.Core.Discovery
{
    public class AssembliesHost : IAssembliesHost
    {
        private readonly IEnumerable<string> _excludedAssemblyNamesSource;
        private readonly string _baseDirectory;
        private readonly string _searchPattern;
        private readonly SearchOption _searchOption;
        public delegate IAssembliesHost Factory(string baseDirectory, SearchOption searchOption, string searchPattern);

        public AssembliesHost(string baseDirectory, SearchOption searchOption, string searchPattern)
        {
            _baseDirectory = baseDirectory;
            _searchOption = searchOption;

            IEnumerable<string> maybe = null; // ObjectFactory.TryGetInstance<IExcludedAssemblyNamesSource>();
            _excludedAssemblyNamesSource = maybe ?? new string[] { };
            _searchPattern = searchPattern;// GlobalSettings.AssembliesSearchPattern;
        }

        public IEnumerable<AssemblyName> GetAssemblies()
        {
            return Directory.GetFiles(_baseDirectory, _searchPattern, _searchOption).Where(CanBeLoaded).Select(AssemblyName.GetAssemblyName);
        }

        private bool CanBeLoaded(string assemblyName)
        {
            return !_excludedAssemblyNamesSource.Any(x => assemblyName.EndsWith(x, true, CultureInfo.InvariantCulture));
        }
    }
}
