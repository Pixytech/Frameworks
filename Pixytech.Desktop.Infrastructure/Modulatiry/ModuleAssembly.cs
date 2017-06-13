using System;
using Pixytech.Core.IoC;

namespace Pixytech.Desktop.Presentation.Infrastructure.Modulatiry
{
    [AttributeUsage(AttributeTargets.Assembly, AllowMultiple = false)]
    public class ModuleAssemblyAttribute : Attribute
    {
        public ModuleAssemblyAttribute(string moduleName, Type entryModuleType)
        {
            if (string.IsNullOrEmpty(moduleName))
            {
                throw new ArgumentNullException("moduleName");
            }

            if (entryModuleType==null)
            {
                throw new ArgumentNullException("entryModuleType");
            }

            if (!typeof (IModule).IsAssignableFrom(entryModuleType))
            {
                throw new TypeLoadException(string.Format("The entryModuletype should implement {0}", typeof(IModule).FullName));
            }

            ModuleName = moduleName;
            EntryPointModuleType = entryModuleType;
        }

        public Type EntryPointModuleType { get; private set; }

        public string ModuleName { get; private set; }
    }
}
