using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using Graphnet.Core.IoC;
using Graphnet.Dashboard.CoreUI.Models;
using Graphnet.Dashboard.Hub.Models;
using Graphnet.Dashboard.WebContracts;
using Graphnet.Dashboard.WebContracts.Security;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Controls.Pageing;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.ExceptionManagement;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Services;
using Graphnet.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure.Commands;
using Graphnet.Wpf.Presentation.Infrastructure.Services.Interfaces;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Security
{
    class SecurityRolesVm : ValidatableViewModelBase
    {
        private readonly IWebComponentService _webComponentService;
        private readonly IWebPermissionMatrix _webPermissionMatrix;
        private readonly ISafeExecutor _executor;
        private readonly IDispatcher _dispatcher;
        private readonly DelegateCommand _initializeCommand;
        private readonly IMessageBoxService _messageBoxService;

        public SecurityRolesVm(IWebComponentService componentService, IPermissionsService permissionsService, ISafeExecutor safeExecutor, IDispatcher dispatcher, IBuilder builder, IMessageBoxService messageBoxService)
        {
            _dispatcher = dispatcher;
            _executor = safeExecutor;
            _webComponentService = componentService;
            _webPermissionMatrix = permissionsService.GetPermissionMatrix(_webComponentService);
            _messageBoxService = messageBoxService;
            RefreshCommand = DelegateCommand.FromAsyncHandler(() => _executor.TryAsync(RefreshAsyncData).Finally(() => { IsBusy = false; }).ExecuteAsync(), () => _webPermissionMatrix.CanChangeRoles && !IsBusy);

            AddRoleCommand = new DelegateCommand(() =>
            {
                var windowViewModel = builder.Build<RoleDetailsWindowVm>();
                windowViewModel.CurrentRole = new RoleModel {EnableValidation = true};
                windowViewModel.NotAllowedNames = Roles.Select(x => x.Name).ToList();
                windowViewModel.IsAdding = true;
                windowViewModel.CurrentRole.IsNameReadOnly = false;

                if (!windowViewModel.GetInput("Add new role")) return;

                SelectedRole = windowViewModel.CurrentRole;
                RefreshCommand.Execute();

            }, () => _webPermissionMatrix.CanChangeRoles && !IsBusy);

            EditRoleCommand = new DelegateCommand(() =>
            {
                var windowViewModel = builder.Build<RoleDetailsWindowVm>();
                windowViewModel.CurrentRole = SelectedRole.Clone();
                windowViewModel.CurrentRole.EnableValidation = true;
                windowViewModel.CurrentRole.IsNameReadOnly = true;
                var invalidNames = Roles.Select(x => x.Name).ToList();
                invalidNames.Remove(SelectedRole.Name);

                windowViewModel.NotAllowedNames = invalidNames;

                if (!windowViewModel.GetInput("Edit role")) return;

                SelectedRole = windowViewModel.CurrentRole;
                RefreshCommand.Execute();

            }, () => _webPermissionMatrix.CanChangeRoles && !IsBusy && SelectedRole != null);

            DeleteRoleCommand = new DelegateCommand(() =>
            {
                if (ValidateAndDeleteRole(SelectedRole))
                {

                }
            }, () => _webPermissionMatrix.CanChangeRoles && !IsBusy && SelectedRole != null && !SelectedRole.IsSystemRole);


            _initializeCommand = DelegateCommand.FromAsyncHandler(OnVmInitialize);
            PageInfo = new PageVm(RefreshCommand, 20);
        }

        private bool ValidateAndDeleteRole(RoleModel selectedRole)
        {
            var hasError = false;

            if ( _messageBoxService.Show(this,
                    string.Format("Do you want to delete role {0} permanently from system", selectedRole.Name),
                    "Confirm action", MessageBoxButton.YesNo, MessageBoxImage.Question) == MessageBoxResult.Yes)
            {
                
                var errorMessage = string.Empty;
                _executor.TryAsync(() => DeleteRole(selectedRole.ToContract())).Catch<Exception>(ex =>
                {
                    hasError = true;
                    errorMessage = ex.Message;
                }).Finally(() => { RefreshCommand.Execute(); IsBusy = false; }).ExecuteAsync();

                if (hasError)
                {
                    _messageBoxService.Show(this, errorMessage, "Error deleteing role", MessageBoxButton.YesNo, MessageBoxImage.Error);
                }
            }
            return !hasError;
        }

        private async Task<bool> DeleteRole(Role selectedRole)
        {
            return await _webComponentService.DeleteRoleAsync(selectedRole.Id);
        }

        protected override async Task OnInitialize()
        {
           await _initializeCommand.Execute();
        }

        private Task OnVmInitialize()
        {
            return _executor.TryAsync(OnInitializeAsync).Finally(() => { IsBusy = false; }).ExecuteAsync();
        }

        private async Task OnInitializeAsync()
        {
            IsBusy = true;
            await RefreshCommand.Execute();
            IsBusy = false;
        }

        private async Task RefreshAsyncData()
        {
            var options = BuildOptions();
            var lastSelection = SelectedRole;
            var results = await _webComponentService.GetRolesAsync(options);

            PageInfo.UpdatePageing(results.CurrentPage, results.TotalPage, results.TotalCount, options.Page.PageSize);
            await _dispatcher.InvokeAsync(() =>
            {
                var roles =  results.Result.ToModel().ToList();

                Roles = roles;

                if (lastSelection != null)
                {
                    var selectedRole = roles.FirstOrDefault(x => x.Name == lastSelection.Name);

                    SelectedRole = selectedRole ?? roles.FirstOrDefault();
                }

                else
                {
                    SelectedRole = roles.FirstOrDefault();
                }
            });
        }

        private RoleOptions BuildOptions()
        {
            var result = new RoleOptions { Page = { PageSize = PageInfo.PageSize } };

            result.Page.Page = !PageInfo.IsDirty ? 1 : PageInfo.CurrentPage;

            return result;
        }

        public DelegateCommand RefreshCommand { get; private set; }

        public bool IsBusy
        {
            get { return GetProperty<bool>(); }
            set
            {
                SetProperty(value);
                RefreshCommands();
            }
        }

        private void RefreshCommands()
        {
            _dispatcher.BeginInvoke(new Action(() =>
            {
                RefreshCommand.RaiseCanExecuteChanged();
                AddRoleCommand.RaiseCanExecuteChanged();
                EditRoleCommand.RaiseCanExecuteChanged();
                DeleteRoleCommand.RaiseCanExecuteChanged();

            }));
        }

        public IEnumerable<RoleModel> Roles
        {
            get { return GetProperty<IEnumerable<RoleModel>>(); }
            set
            {
                SetProperty(value);
                RefreshCommands();
            }
        }

        public RoleModel SelectedRole
        {
            get { return GetProperty<RoleModel>(); }
            set
            {
                SetProperty(value);
                RefreshCommands();
            }
        }

        public PageVm PageInfo
        {
            get { return GetProperty<PageVm>(); }
            set { SetProperty(value); }
        }

        public DelegateCommand AddRoleCommand { get; private set; }

        public DelegateCommand EditRoleCommand { get; private set; }

        public DelegateCommand DeleteRoleCommand { get; private set; }
    }
}
