using System;

namespace Pixytech.Core.Isolation.Hosting
{
    public interface IPluginServer
    {
        event EventHandler ServerExit;
        void ExitProcess();
    }
}
