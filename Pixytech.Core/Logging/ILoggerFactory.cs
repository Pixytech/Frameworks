using System;

namespace Pixytech.Core.Logging
{
    public interface ILoggerFactory
    {
        ILog GetLogger(Type type);
        ILog GetLogger(string name);
    }
}
