using System.IO;
using NLog;
using NLog.Config;
using NLog.Layouts;
using NLog.Targets;

namespace Demo.Helpers
{
    class LogConfigurer
    {
        public void Configure(string logPath)
        {

            var nlogConfig = new LoggingConfiguration();
            var simpleLayout = new SimpleLayout("${longdate}|${threadid}|${level}|${logger:shortName=True}|${message}${onexception:${newline}${exception:format=tostring}}");

            var fileTarget = new FileTarget
            {
                ArchiveEvery = FileArchivePeriod.Day,
                FileName = Path.Combine(logPath, "DashboardLog.txt"),
                ArchiveFileName = Path.Combine(logPath, "DashboardLog.{#}.txt"),
                ArchiveNumbering = ArchiveNumberingMode.Rolling,
                Layout = simpleLayout,
                MaxArchiveFiles = 5,
            };
            
            nlogConfig.LoggingRules.Add(new LoggingRule("*", LogLevel.Info, fileTarget));
            
            nlogConfig.AddTarget("debugger", fileTarget);
            
            LogManager.Configuration = nlogConfig;
        }
    }
}
