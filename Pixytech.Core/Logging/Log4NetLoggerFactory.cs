using System;

namespace Pixytech.Core.Logging
{
    public class NLogLoggerFactory : ILoggerFactory
    {
        private readonly Func<string, object> _getLoggerByStringDelegate;
        public NLogLoggerFactory()
        {
            Type logManagerType = typeof(NLog.LogManager);
            if (logManagerType == null)
            {
                throw new InvalidOperationException("NLog could not be loaded. Make sure that the NLog assembly is located in the executable directory.");
            }
            _getLoggerByStringDelegate = logManagerType.GetStaticFunctionDelegate<string,object>("GetLogger");
        }
        public ILog GetLogger(Type type)
        {
            return new NLogLogger(_getLoggerByStringDelegate(type.FullName));
        }
        public ILog GetLogger(string name)
        {
            object logger = _getLoggerByStringDelegate(name);
            return new NLogLogger(logger);
        }
    }
}
