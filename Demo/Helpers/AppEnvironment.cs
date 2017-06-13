using System;
using System.Linq;
using Demo.Presentation.Infrastructure;

namespace Demo.Helpers
{
    public static class AppEnvironment
    {
        private static string GetClickOnceQueryString(IAppDeployment appDeployment)
        {
            if (appDeployment.IsNetworkDeployed && appDeployment.ActivationUri != null)
            {
                return appDeployment.ActivationUri.Query;
            }

            return null;
        }

        public static string[] GetArguments(IAppDeployment appDeployment)
        {
            var args = Environment.GetCommandLineArgs().ToList();
            args.RemoveAt(0);
            var clickOnceQuery = GetClickOnceQueryString(appDeployment);
            if (!(string.IsNullOrEmpty(clickOnceQuery)))
            {
                args.Add(string.Format("/query:{0}", clickOnceQuery));
            }

            return args.ToArray();
        }
    }
}
