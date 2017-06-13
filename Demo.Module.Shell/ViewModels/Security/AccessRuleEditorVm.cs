using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Graphnet.Core.IoC;
using Graphnet.Core.Utilities;
using Graphnet.Dashboard.Hub.Models;
using Graphnet.Dashboard.WebContracts;
using Graphnet.Dashboard.WebContracts.Security;
using Graphnet.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure.Commands;
using Graphnet.Wpf.Presentation.Infrastructure.Services.Interfaces;
using Graphnet.Wpf.Presentation.Services;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Security
{
    class AccessRuleEditorVm : ViewModelBase
    {
        private readonly IDialogService _dialogService;
        private readonly IDispatcher _dispatcher;
        private readonly IWebComponentService _webComponentService;

        public AccessRuleEditorVm(IDialogService dialogService, IBuilder builder, IDispatcher dispatcher, IWebComponentService webComponentService)
        {
            _dialogService = dialogService;
            _dispatcher = dispatcher;
            _webComponentService = webComponentService;
            AddUserCommand = new DelegateCommand(() =>
            {
                var windowViewModel = builder.Build<StringValueEditorVm>();
                windowViewModel.Current = new ValidatableString();
                windowViewModel.NotAllowedNames = CurrentRule.Users.Select(x => x.Value).ToList();

                if (!windowViewModel.GetInput("Add new user account")) return;

                var newUser = new ValidatableString { Value = windowViewModel.Current.Value };
                CurrentRule.Users.Add(newUser);
                CurrentRule.Validate();
                SelectedUser = newUser;
            }, () => true);

            EditUserCommand = new DelegateCommand(() =>
            {
                var windowViewModel = builder.Build<StringValueEditorVm>();
                windowViewModel.Current = new ValidatableString { Value = SelectedUser.Value };
                var invalidNames = CurrentRule.Users.Select(x => x.Value).ToList();
                invalidNames.Remove(SelectedUser.Value);
                windowViewModel.NotAllowedNames = invalidNames;

                if (!windowViewModel.GetInput("Edit user account")) return;

                SelectedUser.Value = windowViewModel.Current.Value;
                CurrentRule.Validate();
            }, () => SelectedUser != null);

            DeleteUserCommand = new DelegateCommand(() =>
            {
                CurrentRule.Users.Remove(SelectedUser);
                CurrentRule.Validate();
            }, () => SelectedUser != null);

            AddRoleCommand = new DelegateCommand(() =>
            {
                var windowViewModel = builder.Build<StringValueEditorVm>();
                windowViewModel.Current = new ValidatableString();
                windowViewModel.NotAllowedNames = CurrentRule.Roles.Select(x => x.Value).ToList();
                windowViewModel.AllowedList = GetRoles();
                windowViewModel.UsePickupList = true;
                if (!windowViewModel.GetInput("Add new window role")) return;

                var newWindowRole = new ValidatableString { Value = windowViewModel.Current.Value };
                CurrentRule.Roles.Add(newWindowRole);
                SelectedRole = newWindowRole;
                CurrentRule.Validate();
            }, () => true);

            EditRoleCommand = new DelegateCommand(() =>
            {
                var windowViewModel = builder.Build<StringValueEditorVm>();
                windowViewModel.Current = new ValidatableString { Value = SelectedRole.Value };
                var invalidNames = CurrentRule.Roles.Select(x => x.Value).ToList();
                invalidNames.Remove(SelectedRole.Value);
                windowViewModel.NotAllowedNames = invalidNames;
                windowViewModel.AllowedList = GetRoles();
                windowViewModel.UsePickupList = true;
                if (!windowViewModel.GetInput("Edit window role")) return;

                SelectedRole.Value = windowViewModel.Current.Value;
                CurrentRule.Validate();

            }, () => SelectedRole != null);

            DeleteRoleCommand = new DelegateCommand(() =>
            {
                CurrentRule.Roles.Remove(SelectedRole);
                CurrentRule.Validate();
            }, () => SelectedRole != null);

            AddVerbCommand = new DelegateCommand(() =>
            {
                var windowViewModel = builder.Build<StringValueEditorVm>();
                windowViewModel.Current = new ValidatableString();
                windowViewModel.NotAllowedNames = CurrentRule.Verbs.Select(x => x.Value).ToList();
                windowViewModel.AllowedList = new List<Tuple<string,string>>(new[]
                {
                    new Tuple<string, string>(HttpMethod.Get.Method,"Get resource" ) ,
                    new Tuple<string, string>(HttpMethod.Post.Method,"Create resource" ),
                    new Tuple<string, string>(HttpMethod.Put.Method,"Update resource" ) ,
                    new Tuple<string, string>(HttpMethod.Delete.Method,"Delete resource" ) 
                });

                windowViewModel.UsePickupList = true;

                if (!windowViewModel.GetInput("Add new verb")) return;

                var newVerb = new ValidatableString { Value = windowViewModel.Current.Value };
                    CurrentRule.Verbs.Add(newVerb);
                    SelectedVerb = newVerb;
                    CurrentRule.Validate();
              
            }, () => true);

            EditVerbCommand = new DelegateCommand(() =>
            {
                var windowViewModel = builder.Build<StringValueEditorVm>();
                windowViewModel.Current = new ValidatableString { Value = SelectedVerb.Value };
                var invalidNames = CurrentRule.Verbs.Select(x => x.Value).ToList();
                invalidNames.Remove(SelectedVerb.Value);
                windowViewModel.NotAllowedNames = invalidNames;

                if (!windowViewModel.GetInput("Edit Verb")) return;

                SelectedVerb.Value = windowViewModel.Current.Value;
                CurrentRule.Validate();

            }, () => SelectedVerb != null);

            DeleteVerbCommand = new DelegateCommand(() =>
            {
                CurrentRule.Verbs.Remove(SelectedVerb);
                CurrentRule.Validate();
            }, () => SelectedVerb != null);

            SaveCommand = new DelegateCommand(() => _dialogService.Close(this, true), () => (CurrentRule.Users.Any() || CurrentRule.Roles.Any()) );
            CancelCommand = new DelegateCommand(() => _dialogService.Close(this, false), () => true);
        }

        private IEnumerable<Tuple<string, string>> GetRoles()
        {
            var roleOptions = new RoleOptions {Page = {PageSize = 200}};
            var roles = AsyncHelpers.RunSync(() => _webComponentService.GetRolesAsync(roleOptions));
            return roles.Result.Select(role => new Tuple<string, string>(role.Id, role.Description));
        }

        private void RefreshCommands()
        {
            _dispatcher.BeginInvoke(new Action(() =>
            {
                SaveCommand.RaiseCanExecuteChanged();
                CancelCommand.RaiseCanExecuteChanged();

                AddVerbCommand.RaiseCanExecuteChanged();
                EditVerbCommand.RaiseCanExecuteChanged();
                DeleteVerbCommand.RaiseCanExecuteChanged();

                AddRoleCommand.RaiseCanExecuteChanged();
                EditRoleCommand.RaiseCanExecuteChanged();
                DeleteRoleCommand.RaiseCanExecuteChanged();

                AddUserCommand.RaiseCanExecuteChanged();
                EditUserCommand.RaiseCanExecuteChanged();
                DeleteUserCommand.RaiseCanExecuteChanged();
            }));
        }


        protected override async Task OnInitialize()
        {
            CurrentRule.OnAfterValidate((isValid, results) => RefreshCommands());

            CurrentRule.Validate();

            await base.OnInitialize();
        }

        public bool IsAllow
        {
            get { return CurrentRule.Action == AuthorizationRuleAction.Allow; }
            set
            {
                SetProperty(value);
                CurrentRule.Action = value ? AuthorizationRuleAction.Allow : AuthorizationRuleAction.Deny;
            }
        }

        public ValidatableString SelectedVerb
        {
            get { return GetProperty<ValidatableString>(); }
            set
            {
                SetProperty(value);
                RefreshCommands();
            }
        }

        public ValidatableString SelectedUser
        {
            get { return GetProperty<ValidatableString>(); }
            set
            {
                SetProperty(value);
                RefreshCommands();
            }
        }

        public ValidatableString SelectedRole
        {
            get { return GetProperty<ValidatableString>(); }
            set
            {
                SetProperty(value);
                RefreshCommands();
            }
        }

        public AuthorizationRuleModel CurrentRule
        {
            get { return GetProperty<AuthorizationRuleModel>(); }
            set
            {
                SetProperty(value);
                RefreshCommands();
            }
        }

        public DelegateCommand SaveCommand { get; private set; }

        public DelegateCommand CancelCommand { get; private set; }

        public DelegateCommand AddUserCommand { get; private set; }

        public DelegateCommand EditUserCommand { get; private set; }

        public DelegateCommand DeleteUserCommand { get; private set; }

        public DelegateCommand AddRoleCommand { get; private set; }

        public DelegateCommand EditRoleCommand { get; private set; }

        public DelegateCommand DeleteRoleCommand { get; private set; }

        public DelegateCommand AddVerbCommand { get; private set; }

        public DelegateCommand EditVerbCommand { get; private set; }

        public DelegateCommand DeleteVerbCommand { get; private set; }

        public bool GetInput(string title)
        {
            return _dialogService.ShowDialog(this,
                new DialogOptions
                {
                    ActivateParentAfterClose = true,
                    AutoHideHeader = false,
                    IsHeaderVisible = true,
                    IsTitleVisible = true,
                    Title = title,
                }) == true;
        }
    }
}
