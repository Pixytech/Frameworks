using System.Collections.Generic;
using Microsoft.Practices.Prism.Modularity;

namespace Demo.Presentation.Infrastructure.Services
{
    public interface IRemoteModulesCatalog
    {
        void AddModuleInfo(ModuleInfo moduleInfo);

        IEnumerable<ModuleInfo> Modules { get; }

        void Clear();
    }
}
