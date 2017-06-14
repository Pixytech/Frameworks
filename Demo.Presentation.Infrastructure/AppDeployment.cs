using System;
using System.Deployment.Application;
using System.Diagnostics;
using System.Reflection;

namespace Demo.Presentation.Infrastructure
{
    [Serializable]
    public class AppDeployment : IAppDeployment
    {
        public AppDeployment()
        {
            IsNetworkDeployed = ApplicationDeployment.IsNetworkDeployed;
            if (IsNetworkDeployed)
            {
                UpdateLocation = ApplicationDeployment.CurrentDeployment.UpdateLocation;
                ActivationUri = ApplicationDeployment.CurrentDeployment.ActivationUri;
                CurrentVersion = ApplicationDeployment.CurrentDeployment.CurrentVersion;
                DataDirectory = ApplicationDeployment.CurrentDeployment.DataDirectory;
                IsFirstRun = ApplicationDeployment.CurrentDeployment.IsFirstRun;
                TimeOfLastUpdateCheck = ApplicationDeployment.CurrentDeployment.TimeOfLastUpdateCheck;
                UpdatedApplicationFullName = ApplicationDeployment.CurrentDeployment.UpdatedApplicationFullName;
                UpdatedVersion = ApplicationDeployment.CurrentDeployment.UpdatedVersion;
            }
            else
            {

                IsNetworkDeployed = true;
                UpdateLocation = new Uri("http://localhost/demo/demo.application");
                ActivationUri =
                    new Uri(
                        "http://localhost/demo/demo.application");
                
                CurrentVersion = Assembly.GetEntryAssembly().GetName().Version;
                DataDirectory = AppDomain.CurrentDomain.BaseDirectory;
                IsFirstRun = true;
                TimeOfLastUpdateCheck = DateTime.Now;
                UpdatedApplicationFullName =
                    "http://localhost/demo/demo.application#demo.application, Version=1.0.0.49, Culture=neutral, PublicKeyToken=7757227a2641d1ab, processorArchitecture=msil/Demo.Dashboard.exe, Version=1.0.0.49, Culture=neutral, PublicKeyToken=7757227a2641d1ab, processorArchitecture=msil, type=win32";
                UpdatedVersion = Assembly.GetEntryAssembly().GetName().Version;

            }
        }

        public bool IsNetworkDeployed { get;  set; }

        public Uri UpdateLocation { get;  set;  }

        public Uri ActivationUri { get;  set; }

        public Version CurrentVersion { get;  set; }

        public string DataDirectory { get;  set; }

        public bool IsFirstRun { get;  set; }

        public DateTime TimeOfLastUpdateCheck { get;  set; }

        public string UpdatedApplicationFullName { get;  set; }

        public Version UpdatedVersion { get;  set; }
    }
}
