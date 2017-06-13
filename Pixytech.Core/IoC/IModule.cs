using System;

namespace Pixytech.Core.IoC
{
    public interface IModule
    {
        void Configure(IConfigureTypes configurer);
    }
}
