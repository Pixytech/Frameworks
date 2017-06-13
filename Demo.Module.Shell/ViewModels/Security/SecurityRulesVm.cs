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
    class SecurityRulesVm : ValidatableViewModelBase
    {
        private readonly IWebComponentService _webComponentService;
        private readonly IWebPermissionMatrix _webPermissionMatrix;
        private readonly ISafeExecutor _executor;
        private readonly IDispatcher _dispatcher;
        private readonly DelegateCommand _initializeCommand;
        private readonly IMessageBoxService _messageBoxService;

        public SecurityRulesVm(IWebComponentService componentService, IPermissionsService permissionsService, ISafeExecutor safeExecutor, IDispatcher dispatcher, IBuilder builder, IMessageBoxService messageBoxService)
        {
            _dispatcher = dispatcher;
            _executor = safeExecutor;
            _webComponentService = componentService;
            _webPermissionMatrix = permissionsService.GetPermissionMatrix(_webComponentService);
            _messageBoxService = messageBoxService;
            RefreshCommand = DelegateCommand.FromAsyncHandler(() => _executor.TryAsync(RefreshAsyncData).Finally(() => { IsBusy = false; }).ExecuteAsync(), () => _webPermissionMatrix.CanChangeRules && !IsBusy);

            AddRuleCommand = new DelegateCommand(() =>
            {
                var windowViewModel = builder.Build<RuleDetailsWindowVm>();
                windowViewModel.CurrentRule = new ResourceAuthorizationModel {EnableValidation = true};

                windowViewModel.NotAllowedRules = Rules;
                windowViewModel.IsAdding = true;

                if (!windowViewModel.GetInput("Add new rule")) return;

                SelectedRule = windowViewModel.CurrentRule;
                RefreshCommand.Execute();

            }, () => _webPermissionMatrix.CanChangeRules && !IsBusy);

            EditRuleCommand = new DelegateCommand(() =>
            {
                var windowViewModel = builder.Build<RuleDetailsWindowVm>();
                windowViewModel.CurrentRule = SelectedRule.Clone();
                windowViewModel.CurrentRule.EnableValidation = true;
                windowViewModel.CurrentRule.IsNameReadOnly = true;
                var rules = Rules.ToList();
                var current = rules.FirstOrDefault(x => x.Id == SelectedRule.Id);
                rules.Remove(current);
                windowViewModel.NotAllowedRules = rules;
                if (!windowViewModel.GetInput("Edit rule")) return;

                SelectedRule = windowViewModel.CurrentRule;
                RefreshCommand.Execute();

            }, () => _webPermissionMatrix.CanChangeRules && !IsBusy && SelectedRule != null);

            DeleteRuleCommand = new DelegateCommand(() =>
            {
                if (ValidateAndDeleteRule(SelectedRule))
                {
                    
                }
            }, () => _webPermissionMatrix.CanChangeRules && !IsBusy && SelectedRule != null && !SelectedRule.IsSystemRule);


            _initializeCommand = DelegateCommand.FromAsyncHandler(OnVmInitialize);
            PageInfo = new PageVm(RefreshCommand, 30);
        }

        private bool ValidateAndDeleteRule(ResourceAuthorizationModel selectedRule)
        {
            var hasError = false;

            if (_messageBoxService.Show(this,
                    string.Format("Do you want to delete rule with patterns '{0}' permanently from system", selectedRule.PatternsFlat),
                    "Confirm action", MessageBoxButton.YesNo, MessageBoxImage.Question) == MessageBoxResult.Yes)
            {

                var errorMessage = string.Empty;
                _executor.TryAsync(() => DeleteRule(selectedRule.ToContract())).Catch<Exception>(ex =>
                {
                    hasError = true;
                    errorMessage = ex.Message;
                }).Finally(() => { RefreshCommand.Execute(); IsBusy = false; }).ExecuteAsync();

                if (hasError)
                {
                    _messageBoxService.Show(this, errorMessage, "Error deleteing rule", MessageBoxButton.YesNo, MessageBoxImage.Error);
                }
            }
            return !hasError;
        }

        private async Task<bool> DeleteRule(ResourceAuthorization rule)
        {
            return await _webComponentService.DeleteResourceRuleAsync(rule.Id);
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
            
            var lastSelection = SelectedRule;

            var results = await _webComponentService.GetResourceRulesAsync(options);

            PageInfo.UpdatePageing(results.CurrentPage, results.TotalPage, results.TotalCount, options.Page.PageSize);
            await _dispatcher.InvokeAsync(() =>
            {
                var rules = results.Result.ToModel().ToList();
                Rules = rules;
                if (lastSelection != null)
                {
                    var selectedRule = Rules.FirstOrDefault(x => x.Id == lastSelection.Id);

                    SelectedRule = selectedRule ?? Rules.FirstOrDefault();
                }

                else
                {
                    SelectedRule = Rules.FirstOrDefault();
                }
            });
        }

        private AuthorizationRuleOptions BuildOptions()
        {
            var result = new AuthorizationRuleOptions { Page = { PageSize = PageInfo.PageSize } };

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
                AddRuleCommand.RaiseCanExecuteChanged();
                EditRuleCommand.RaiseCanExecuteChanged();
                DeleteRuleCommand.RaiseCanExecuteChanged();

            }));
        }

        public IEnumerable<ResourceAuthorizationModel> Rules
        {
            get { return GetProperty<IEnumerable<ResourceAuthorizationModel>>(); }
            set
            {
                SetProperty(value);
                RefreshCommands();
            }
        }

        public ResourceAuthorizationModel SelectedRule
        {
            get { return GetProperty<ResourceAuthorizationModel>(); }
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

        public DelegateCommand AddRuleCommand { get; private set; }

        public DelegateCommand EditRuleCommand { get; private set; }

        public DelegateCommand DeleteRuleCommand { get; private set; }
    }
}
