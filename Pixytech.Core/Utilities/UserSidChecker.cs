using System.Security.Principal;

namespace Pixytech.Core.Utilities
{
    public static class UserSidChecker
    {
        public static bool IsNotSystemSid()
        {
            var windowsIdentity = WindowsIdentity.GetCurrent();
            return windowsIdentity != null &&
                   windowsIdentity.User != null &&
                   !windowsIdentity.User.IsWellKnown(WellKnownSidType.LocalSystemSid);
        }
    }
}
