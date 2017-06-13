using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Graphnet.Core.IoC;
using Graphnet.Dashboard.CoreUI.Models;
using Graphnet.Dashboard.Hub.Models;
using Graphnet.Dashboard.WebContracts;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.ExceptionManagement;
using Graphnet.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure.Commands;
using Graphnet.Wpf.Presentation.Infrastructure.Services.Interfaces;
using Graphnet.Wpf.Presentation.Services;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Security
{
    class RoleDetailsWindowVm : ViewModelBase
    {
        private readonly IDispatcher _dispatcher;
        private readonly IDialogService _dialogService;
        private bool _isValid;
        private readonly ISafeExecutor _executor;
        private readonly IWebComponentService _webComponentService;

        public RoleDetailsWindowVm(IDispatcher dispatcher, IDialogService dialogService, IBuilder builder, ISafeExecutor executor, IWebComponentService webComponentService)
        {
            _dispatcher = dispatcher;
            _dialogService = dialogService;
            _executor = executor;
            _webComponentService = webComponentService;

            AddUserCommand = new DelegateCommand(() =>
            {
                var windowViewModel = builder.Build<StringValueEditorVm>();
                windowViewModel.Current = new ValidatableString();
                windowViewModel.NotAllowedNames = CurrentRole.Users.Select(x=>x.Value).ToList();

                if (!windowViewModel.GetInput("Add new user account")) return;

                var newUser = new ValidatableString {Value = windowViewModel.Current.Value};
                CurrentRole.Users.Add(newUser);
                SelectedUser = newUser;
                CurrentRole.Validate();

            }, () => true);

            EditUserCommand = new DelegateCommand(() =>
            {
                var windowViewModel = builder.Build<StringValueEditorVm>();
                windowViewModel.Current = new ValidatableString {Value = SelectedUser.Value};
                var invalidNames = CurrentRole.Users.Select(x => x.Value).ToList();
                invalidNames.Remove(SelectedUser.Value);

                windowViewModel.NotAllowedNames = invalidNames;

                if (!windowViewModel.GetInput("Edit user account")) return;
                SelectedUser.Value = windowViewModel.Current.Value;
                CurrentRole.Validate();

            }, () => SelectedUser != null);

            DeleteUserCommand = new DelegateCommand(() =>
            {
                CurrentRole.Users.Remove(SelectedUser);
                CurrentRole.Validate();
            }, () => SelectedUser != null);

            AddGroupCommand = new DelegateCommand(() =>
            {
                var windowViewModel = builder.Build<StringValueEditorVm>();
                windowViewModel.Current = new ValidatableString();
                windowViewModel.NotAllowedNames = CurrentRole.Groups.Select(x => x.Value).ToList();

                if (!windowViewModel.GetInput("Add new window group")) return;

                var newWindowGroup = new ValidatableString {Value = windowViewModel.Current.Value};
                CurrentRole.Groups.Add(newWindowGroup);
                SelectedGroup = newWindowGroup;
                CurrentRole.Validate();

            }, () => true);

            EditGroupCommand = new DelegateCommand(() =>
            {
                var windowViewModel = builder.Build<StringValueEditorVm>();
                windowViewModel.Current = new ValidatableString {Value = SelectedGroup.Value};
                var invalidNames = CurrentRole.Groups.Select(x => x.Value).ToList();
                invalidNames.Remove(SelectedGroup.Value);
                windowViewModel.NotAllowedNames = invalidNames;

                if (!windowViewModel.GetInput("Edit window group")) return;

                SelectedGroup.Value = windowViewModel.Current.Value;
                CurrentRole.Validate();

            }, () => SelectedGroup != null);

            DeleteGroupCommand = new DelegateCommand(() =>
            {
                CurrentRole.Groups.Remove(SelectedGroup);
                CurrentRole.Validate();
            }, () => SelectedGroup != null);

            SaveCommand = DelegateCommand.FromAsyncHandler(() => _executor.TryAsync(SaveRoleAsync).Finally(() =>
            {
                
            }).ExecuteAsync(), () => _isValid );

            CancelCommand = new DelegateCommand(() => _dialogService.Close(this, false), () => true);
        }

        private async Task SaveRoleAsync()
        {
            
            if (IsAdding)
            {
                var contract = CurrentRole.ToContract();
                var role = await _webComponentService.AddRoleAsync(contract);
                if (role != null)
                {
                    await _dispatcher.InvokeAsync(() => _dialogService.Close(this, true));
                }
            }
            else
            {
                var contract = CurrentRole.ToContract();
                var role = await _webComponentService.UpdateRoleAsync(contract);
                if (role != null)
                {
                    await _dispatcher.InvokeAsync(() => _dialogService.Close(this, true));
                }
            }
        }

        protected override async Task OnInitialize()
        {
            CurrentRole.OnAfterValidate((isValid, results) =>
            {
                _isValid = isValid && ValidateUnique(results);
                RefreshCommands();
            });

            CurrentRole.Validate();

            await base.OnInitialize();
        }

        private bool ValidateUnique(ICollection<ValidationResult> results)
        {
            if (NotAllowedNames != null && NotAllowedNames.FirstOrDefault(x => x.Equals(CurrentRole.Name,StringComparison.OrdinalIgnoreCase )) != null)
            {
                results.Add(new ValidationResult("Role name already exists in the collection",
                    new List<string>(new[] { "Name" })));
                return false;
            }

            return true;
        }

        public RoleModel CurrentRole
        {
            get { return GetProperty<RoleModel>(); }
            set
            {
                SetProperty(value);
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

        private void RefreshCommands()
        {
            _dispatcher.BeginInvoke(new Action(() =>
            {
                AddUserCommand.RaiseCanExecuteChanged();
                EditUserCommand.RaiseCanExecuteChanged();
                DeleteUserCommand.RaiseCanExecuteChanged();
                AddGroupCommand.RaiseCanExecuteChanged();
                EditGroupCommand.RaiseCanExecuteChanged();
                DeleteGroupCommand.RaiseCanExecuteChanged();
                SaveCommand.RaiseCanExecuteChanged();
                CancelCommand.RaiseCanExecuteChanged();
            }));
        }

        public ValidatableString SelectedGroup
        {
            get { return GetProperty<ValidatableString>(); }
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

        public DelegateCommand AddGroupCommand { get; private set; }

        public DelegateCommand EditGroupCommand { get; private set; }

        public DelegateCommand DeleteGroupCommand { get; private set; }

        public List<string> NotAllowedNames { get; set; }

        public bool IsAdding { get; set; }

        public bool GetInput(string title)
        {
            if (_dialogService.ShowDialog(this,
                new DialogOptions
                {
                    ActivateParentAfterClose = true,
                    AutoHideHeader = false,
                    IsHeaderVisible = true,
                    IsTitleVisible = true,
                    Title = title,
                }) == true)
            {
                return true;
            }
            return false;
        }
    }
}
