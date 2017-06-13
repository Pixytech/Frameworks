using System;

namespace Pixytech.Core.Logging
{
    public class NLogLogger : ILog
    {
        private readonly object _logger;
        private static readonly Func<object, bool> IsDebugEnabledDelegate;
        private static readonly Func<object, bool> IsInfoEnabledDelegate;
        private static readonly Func<object, bool> IsWarnEnabledDelegate;
        private static readonly Func<object, bool> IsErrorEnabledDelegate;
        private static readonly Func<object, bool> IsFatalEnabledDelegate;
        private static readonly Action<object, string> DebugDelegate;
        private static readonly Action<object, string, Exception> DebugExceptionDelegate;
        private static readonly Action<object, string, object[]> DebugFormatDelegate;
        private static readonly Action<object, string> InfoDelegate;
        private static readonly Action<object, string, Exception> InfoExceptionDelegate;
        private static readonly Action<object, string, object[]> InfoFormatDelegate;
        private static readonly Action<object, string> WarnDelegate;
        private static readonly Action<object, string, Exception> WarnExceptionDelegate;
        private static readonly Action<object, string, object[]> WarnFormatDelegate;
        private static readonly Action<object, string> ErrorDelegate;
        private static readonly Action<object, string, Exception> ErrorExceptionDelegate;
        private static readonly Action<object, string, object[]> ErrorFormatDelegate;
        private static readonly Action<object, string> FatalDelegate;
        private static readonly Action<object, string, Exception> FatalExceptionDelegate;
        private static readonly Action<object, string, object[]> FatalFormatDelegate;
        public bool IsDebugEnabled
        {
            get
            {
                return IsDebugEnabledDelegate(_logger);
            }
        }
        public bool IsInfoEnabled
        {
            get
            {
                return IsInfoEnabledDelegate(_logger);
            }
        }
        public bool IsWarnEnabled
        {
            get
            {
                return IsWarnEnabledDelegate(_logger);
            }
        }
        public bool IsErrorEnabled
        {
            get
            {
                return IsErrorEnabledDelegate(_logger);
            }
        }
        public bool IsFatalEnabled
        {
            get
            {
                return IsFatalEnabledDelegate(_logger);
            }
        }
        static NLogLogger()
        {
            Type logType = typeof(NLog.Logger);
            IsDebugEnabledDelegate = logType.GetInstancePropertyDelegate<bool>("IsDebugEnabled");
            IsInfoEnabledDelegate = logType.GetInstancePropertyDelegate<bool>("IsInfoEnabled");
            IsWarnEnabledDelegate = logType.GetInstancePropertyDelegate<bool>("IsWarnEnabled");
            IsErrorEnabledDelegate = logType.GetInstancePropertyDelegate<bool>("IsErrorEnabled");
            IsFatalEnabledDelegate = logType.GetInstancePropertyDelegate<bool>("IsFatalEnabled");
            DebugDelegate = logType.GetInstanceMethodDelegate<string>("Debug");
            DebugExceptionDelegate = logType.GetInstanceMethodDelegate<string,Exception>("DebugException");
            DebugFormatDelegate = logType.GetInstanceMethodDelegate<string,object[]>("Debug");
            InfoDelegate = logType.GetInstanceMethodDelegate<string>("Info");
            InfoExceptionDelegate = logType.GetInstanceMethodDelegate<string,Exception>("InfoException");
            InfoFormatDelegate = logType.GetInstanceMethodDelegate<string,object[]>("Info");
            WarnDelegate = logType.GetInstanceMethodDelegate<string>("Warn");
            WarnExceptionDelegate = logType.GetInstanceMethodDelegate<string,Exception>("WarnException");
            WarnFormatDelegate = logType.GetInstanceMethodDelegate<string,object[]>("Warn");
            ErrorDelegate = logType.GetInstanceMethodDelegate<string>("Error");
            ErrorExceptionDelegate = logType.GetInstanceMethodDelegate<string,Exception>("ErrorException");
            ErrorFormatDelegate = logType.GetInstanceMethodDelegate<string,object[]>("Error");
            FatalDelegate = logType.GetInstanceMethodDelegate<string>("Fatal");
            FatalExceptionDelegate = logType.GetInstanceMethodDelegate<string,Exception>("FatalException");
            FatalFormatDelegate = logType.GetInstanceMethodDelegate<string,object[]>("Fatal");
        }
        public NLogLogger(object logger)
        {
            _logger = logger;
        }
        public void Debug(string message)
        {
            DebugDelegate(_logger, message);
        }
        public void Debug(string message, Exception exception)
        {
            DebugExceptionDelegate(_logger, message, exception);
        }
        public void DebugFormat(string format, params object[] args)
        {
            DebugFormatDelegate(_logger, format, args);
        }
        public void Info(string message)
        {
            InfoDelegate(_logger, message);
        }
        public void Info(string message, Exception exception)
        {
            InfoExceptionDelegate(_logger, message, exception);
        }
        public void InfoFormat(string format, params object[] args)
        {
            InfoFormatDelegate(_logger, format, args);
        }
        public void Warn(string message)
        {
            WarnDelegate(_logger, message);
        }
        public void Warn(string message, Exception exception)
        {
            WarnExceptionDelegate(_logger, message, exception);
        }
        public void WarnFormat(string format, params object[] args)
        {
            WarnFormatDelegate(_logger, format, args);
        }
        public void Error(string message)
        {
            ErrorDelegate(_logger, message);
        }
        public void Error(string message, Exception exception)
        {
            ErrorExceptionDelegate(_logger, message, exception);
        }
        public void ErrorFormat(string format, params object[] args)
        {
            ErrorFormatDelegate(_logger, format, args);
        }
        public void Fatal(string message)
        {
            FatalDelegate(_logger, message);
        }
        public void Fatal(string message, Exception exception)
        {
            FatalExceptionDelegate(_logger, message, exception);
        }
        public void FatalFormat(string format, params object[] args)
        {
            FatalFormatDelegate(_logger, format, args);
        }
    }
}
