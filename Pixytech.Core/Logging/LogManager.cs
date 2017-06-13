using System;

namespace Pixytech.Core.Logging
{
    public class LogManager
    {
        private static ILoggerFactory _loggerFactory = new NLogLoggerFactory();

        public static ILoggerFactory LoggerFactory
        {
            get
            {
                return _loggerFactory;
            }
            set
            {
                if (value == null)
                {
                    throw new ArgumentNullException("value");
                }
                _loggerFactory = value;
            }
        }
        public static ILog GetLogger(Type type)
        {
            return _loggerFactory.GetLogger(type);
        }
        public static ILog GetLogger(string name)
        {
            return _loggerFactory.GetLogger(name);
        }
    }
}
