using System;
using System.Reflection;
using System.Text;
using System.Windows;

using Pixytech.Core.Logging;
using Pixytech.Core;
using Pixytech.Core.IoC;
using Demo.Helpers;
using Demo.Presentation.Infrastructure;
using Demo.ViewModels;
using Demo.Views;

namespace Demo
{
    class Program
    {
        private static readonly ILog Logger = LogManager.GetLogger(typeof(Program));
        [STAThread]
        private static int Main()
        {
           IAssemblyResolver resolver = AssemblyResolverFactory.CreateResolver();
            resolver.Attach();

            ObjectFactory.Configure(c =>
            {
                c.ConfigureType(AssemblyResolverFactory.CreateResolver, ObjectLifecycle.SingleInstance);
            });
            new LogConfigurer().Configure(AppDomain.CurrentDomain.BaseDirectory);

            Logger.InfoFormat("\r\n\r\n****************** Demo Client Shell **************** \r\n Run time version {0}\r\n\r\n", Assembly.GetEntryAssembly().ImageRuntimeVersion);

            var appDeployment = new AppDeployment();

            var arguments = AppEnvironment.GetArguments(appDeployment);

            
            Logger.InfoFormat("Starting Demo client with arguments {0}, IsNetworkDeployed{1}", string.Join(" ", arguments), appDeployment.IsNetworkDeployed);

            if (appDeployment.IsNetworkDeployed)
            {
                var builder = new StringBuilder();
                builder.AppendFormat("ActivationUri: {0}\r\n", appDeployment.ActivationUri);
                builder.AppendFormat("CurrentVersion: {0}\r\n", appDeployment.CurrentVersion);
                builder.AppendFormat("DataDirectory: {0}\r\n", appDeployment.DataDirectory);
                builder.AppendFormat("IsFirstRun: {0}\r\n", appDeployment.IsFirstRun);
                builder.AppendFormat("UpdateLocation: {0}\r\n", appDeployment.UpdateLocation);
                builder.AppendFormat("TimeOfLastUpdateCheck: {0}\r\n", appDeployment.TimeOfLastUpdateCheck);
                builder.AppendFormat("UpdatedApplicationFullName: {0}\r\n", appDeployment.UpdatedApplicationFullName);
                builder.AppendFormat("UpdatedVersion: {0}\r\n", appDeployment.UpdatedVersion);
               Logger.InfoFormat("Application Deployment Information : \r\n {0}", builder.ToString());
            }

            AppDomain.CurrentDomain.UnhandledException += domain_UnhandledException;

            return new ProgramAppEntry(appDeployment, new SplashViewModel()).Start(arguments);
        }

        static void domain_UnhandledException(object sender, UnhandledExceptionEventArgs e)
        {
           Logger.ErrorFormat("UnhandledException from trusted domain {0}", e.ExceptionObject.ToString());
            //var unexpectedShutdownWindow = new UnexpectedShutdownWindow
            //{
            //    Exception = (Exception) e.ExceptionObject,
            //    Title = "Unexpected Error"
            //};
            //unexpectedShutdownWindow.ShowDialog();
        }
    }
}
