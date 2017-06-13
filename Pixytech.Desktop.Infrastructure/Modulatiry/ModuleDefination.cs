using System.Collections.Generic;

namespace Pixytech.Desktop.Presentation.Infrastructure.Modulatiry
{
    public class ModuleDefination
    {
        
        internal ModuleDefination(IEnumerable<AssemblyPart> parts)
        {
            Parts = parts;
        }

        public IEnumerable<AssemblyPart> Parts { get; private set; }

        public string EntryPointAssembly { get; set; }
        public string EntryPointType { get; set; }
        public string RuntimeVersion { get; set; }
        public string ModuleName { get; set; }
    }
}
