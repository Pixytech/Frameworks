using System;

namespace Demo.Presentation.Infrastructure
{
    public interface IAppDeployment
    {
        bool IsNetworkDeployed { get; }
        Uri UpdateLocation { get; }

        Uri ActivationUri { get; }

        Version CurrentVersion { get; }
        Version UpdatedVersion { get; }
        string DataDirectory { get; }

        bool IsFirstRun { get; }

        DateTime TimeOfLastUpdateCheck { get; }

        string UpdatedApplicationFullName { get; }
    }
}
