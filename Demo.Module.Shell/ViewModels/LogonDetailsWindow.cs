using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Helpers;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Services;
using Graphnet.Wpf.Presentation.Helpers;
using Graphnet.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure.Commands;

namespace Graphnet.Dashboard.CoreUI.ViewModels
{
    class LogonDetailsWindowVm : ViewModelBase
    {
        private readonly IPermissionsService _permissionsService;
        private readonly IDispatcher _dispatcher;
        private readonly DelegateCommand _initializeCommand;

        public LogonDetailsWindowVm(IPermissionsService permissionsService, IDispatcher dispatcher, IClipboard clipboard, IAppDeployment appDeployment)
        {
            _dispatcher = dispatcher;
            _permissionsService = permissionsService;

            Version = string.Format("{0}", appDeployment.CurrentVersion);
            Source = string.Format("{0}", appDeployment.ActivationUri);

            _initializeCommand = DelegateCommand.FromAsyncHandler(OnVmInitialize);
            RefreshCommand = DelegateCommand.FromAsyncHandler(OnRefreshAsync, CanRefresh);
            CopyCommand = new DelegateCommand(() =>
            {

                var groups = new List<PermissionSet>(Groups);
                var result = new StringBuilder();
                result.AppendFormat("User Name \t{0}\t\r\n", UserName);
                result.AppendFormat("Computer \t{0}\t\r\n", ComputerName);
                groups.ForEach(g =>
                {
                    result.AppendFormat("\t{0}\t\r\n", g.ComponentName);
                    g.Matrix.ForEach(m => result.AppendFormat("\t\t{0}\r\n", m.Name));
                });

                result.AppendFormat("Version \t{0}\t\r\n", Version);
                result.AppendFormat("ActivationUrl \t{0}\t\r\n", Source);
                
                clipboard.Copy(result.ToString());
            });
            
        }

        public string Version { get; private set; }

        public string UserName
        {
            get { return GetProperty<string>(); }
            set { SetProperty(value); }
        }

        public string ComputerName
        {
            get { return GetProperty<string>(); }
            set { SetProperty(value); }
        }

        protected async override Task OnInitialize()
        {
           await _initializeCommand.Execute();
        }

        public IEnumerable<PermissionSet> Groups
        {
            get { return GetProperty<IEnumerable<PermissionSet>>(); }
            set
            {
                SetProperty(value);
            }
        }

        private async Task OnVmInitialize()
        {
            IsBusy = true;

            var user = WindowsIdentity.GetCurrent();

            ComputerName = Environment.MachineName;

            if (user != null)
            {
                UserName = user.Name;
            }


            var result = _permissionsService.GetCurrentPermissions().ToList();

            var permissionSet = new List<PermissionSet>(result);
            var permissionsetToRemove = new List<PermissionSet>();

            permissionSet.ForEach(s =>
            {
                var itemsToRemove = new List<PermissionMetaData>();
                var matrixSet = new List<PermissionMetaData>(s.Matrix);

                matrixSet.ForEach(m => { if (!m.IsAllowed) itemsToRemove.Add(m); });
                itemsToRemove.ForEach(i => matrixSet.Remove(i));

                s.Matrix = matrixSet.OrderBy(x => x.Name);
                if (matrixSet.Count == 0) permissionsetToRemove.Add(s);
            });

            permissionsetToRemove.ForEach(i => permissionSet.Remove(i));

            var orderedSet = permissionSet.OrderBy(x => x.ComponentName);
            
            await _dispatcher.InvokeAsync(() =>
            {
                Groups = orderedSet;
                IsBusy = false;
            });

        }

        private bool CanRefresh()
        {
            return !IsBusy;
        }

        private async Task OnRefreshAsync()
        {
            _permissionsService.Reset();
            await _initializeCommand.Execute();
        }
        
        public DelegateCommand RefreshCommand { get; private set; }

        public bool IsBusy
        {
            get { return GetProperty<bool>(); }
            set
            {
                SetProperty(value);
                _dispatcher.BeginInvoke(new Action(() => RefreshCommand.RaiseCanExecuteChanged()));
                
            }
        }

        public DelegateCommand CopyCommand { get; set; }

        public string Source { get; private set; }
    }
}
