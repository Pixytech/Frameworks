using System;
using System.Reflection;
using System.Security;
using System.Security.Permissions;
using System.Security.Policy;

namespace Pixytech.Core.Isolation.Hosting
{
    internal static class PlugInActivator
    {
        [SecuritySafeCritical]
        internal static StrongName CreateStrongName(Assembly assembly)
        {
            new FileIOPermission(PermissionState.None)
            {
                AllLocalFiles = FileIOPermissionAccess.PathDiscovery
            }.Assert();
            AssemblyName name = assembly.GetName();
            CodeAccessPermission.RevertAssert();
            byte[] publicKey = name.GetPublicKey();
            if (publicKey == null || publicKey.Length == 0)
            {
                throw new InvalidOperationException("Assembly is not strongly named");
            }

            var blob = new StrongNamePublicKeyBlob(publicKey);
            return new StrongName(blob, name.Name, name.Version);
        }
    }
}
