using System;
using System.Collections.Generic;
using Microsoft.Practices.Prism.Modularity;

namespace Demo.Modules
{
    public interface IRemoteModuleManager
    {
        IEnumerable<ModuleInfo> Build();

        void DownloadModules(Action<Exception> finishedCallback);

        bool UseLocalModules { get; set; }
    }
}
