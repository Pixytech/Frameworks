using System.Collections.Generic;
using Microsoft.Practices.Prism.Modularity;

namespace Demo.Presentation.Infrastructure.Services
{
    class RemoteModulesCatalog : IRemoteModulesCatalog
    {
        readonly List<ModuleInfo> _modules = new List<ModuleInfo>();

        public void AddModuleInfo(ModuleInfo moduleInfo)
        {
            _modules.Add(moduleInfo);
        }

        public IEnumerable<ModuleInfo> Modules
        {
            get { return _modules; }
        }


        public void Clear()
        {
           _modules.Clear();
        }
    }
}
