using System;
using System.Security;
using System.Security.Permissions;
using Pixytech.Core.Isolation.Infrastructure;

namespace Pixytech.Core.Isolation.Hosting
{
    [SecurityPermission(SecurityAction.Demand, Infrastructure = true)]
    internal sealed class PluginServerWorker : MarshalByRefObject
    {
        public PluginServer PluginServer { get; set; }

        //[SecuritySafeCritical]
        //public void SetAppDomainOwner(IPluginContract contract)
        //{
        //    new SecurityPermission(SecurityPermissionFlag.ControlAppDomain).Assert();
        //    AppDomain.CurrentDomain.SetData("Pixytech.Plugin_Owner_Contract", contract);
        //}

        public PluginLoader Activate(IPluginToken pipeline, out ActivationWorker worker)
        {
            worker = new ActivationWorker(pipeline);
            return worker.Activate<PluginLoader>();
        }

        [SecurityCritical]
        public void UnloadAppDomain()
        {
            var securityPermission = new SecurityPermission(SecurityPermissionFlag.ControlAppDomain);
            securityPermission.Assert();
            AppDomain.Unload(AppDomain.CurrentDomain);
        }

        [SecurityCritical]
        ~PluginServerWorker()
        {
            if (PluginServer != null)
            {
                try
                {
                    PluginServer.AddInDomainFinalized();
                }
                catch
                {
                }
                finally
                {
                    PluginServer = null;
                }
            }
        }

        [SecuritySafeCritical]
        public PluginServerWorker()
        {
            var permissionSet = new PermissionSet(PermissionState.None);
            permissionSet.AddPermission(new SecurityPermission(SecurityPermissionFlag.ControlPrincipal));
            permissionSet.AddPermission(new SecurityPermission(SecurityPermissionFlag.UnmanagedCode));
            permissionSet.AddPermission(new ReflectionPermission(PermissionState.Unrestricted));
            permissionSet.Assert();
            RemotingHelper.InitializeClientChannel();
        }
    }
}
