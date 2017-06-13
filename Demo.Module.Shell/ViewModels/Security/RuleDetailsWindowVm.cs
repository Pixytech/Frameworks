using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
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
    class RuleDetailsWindowVm : ViewModelBase
    {
        private readonly IDispatcher _dispatcher;
        private readonly IDialogService _dialogService;
        private bool _isValid;
        private readonly ISafeExecutor _executor;
        private readonly IWebComponentService _webComponentService;
        private bool _initialize;

        public RuleDetailsWindowVm(IDispatcher dispatcher, IDialogService dialogService, IBuilder builder, ISafeExecutor executor, IWebComponentService webComponentService)
        {
            _dispatcher = dispatcher;
            _dialogService = dialogService;
            _executor = executor;
            _webComponentService = webComponentService;
            NotAllowedRules = new List<ResourceAuthorizationModel>();
            Categories = new ObservableCollection<string>();
            AddPatternCommand = new DelegateCommand(() =>
            {
                var windowViewModel = builder.Build<PatternEditWindowVm>();
                windowViewModel.Current = new ValidatableString();
                windowViewModel.NotAllowedNames = CurrentRule.Patterns.Select(x => x.Value).ToList();
                windowViewModel.WebResourceValuesProvider.ComponentName = CurrentRule.Category;

                if (!windowViewModel.GetInput("Add request uri pattern")) return;

                var pattern = new ValidatableString {Value = windowViewModel.Current.Value};
                CurrentRule.Patterns.Add(pattern);
                SelectedPattern = pattern;
                CurrentRule.Validate();

            }, () => true);


            EditPatternCommand = new DelegateCommand(() =>
            {
                var windowViewModel = builder.Build<PatternEditWindowVm>();
                windowViewModel.WebResourceValuesProvider.ComponentName = CurrentRule.Category;
                windowViewModel.Current = new ValidatableString {Value = SelectedPattern.Value};
                var invalidNames = CurrentRule.Patterns.Select(x => x.Value).ToList();
                invalidNames.Remove(SelectedPattern.Value);
                windowViewModel.NotAllowedNames = invalidNames;

                if (!windowViewModel.GetInput("Edit request uri pattern")) return;

                SelectedPattern.Value = windowViewModel.Current.Value;
                CurrentRule.Validate();

            }, () => SelectedPattern != null);

            DeletePatternCommand = new DelegateCommand(() =>
            {
                CurrentRule.Patterns.Remove(SelectedPattern);
                CurrentRule.Validate();
            }, () => SelectedPattern != null);

            AddRuleCommand = new DelegateCommand(() =>
            {
                var windowViewModel = builder.Build<AccessRuleEditorVm>();
                windowViewModel.CurrentRule = new AuthorizationRuleModel();
                if (!windowViewModel.GetInput("Add new access rule")) return;

                var accessRule = windowViewModel.CurrentRule;
                CurrentRule.AccessRules.Add(accessRule);
                SelectedRule = accessRule;
                CurrentRule.Validate();

            }, () => true);

            EditRuleCommand = new DelegateCommand(() =>
            {
                var windowViewModel = builder.Build<AccessRuleEditorVm>();
                windowViewModel.CurrentRule = SelectedRule.Clone();

                if (!windowViewModel.GetInput("Edit access rule")) return;

                CurrentRule.AccessRules.Remove(SelectedRule);
                CurrentRule.AccessRules.Add(windowViewModel.CurrentRule);
                SelectedRule = windowViewModel.CurrentRule;
                CurrentRule.Validate();

            }, () => SelectedRule != null);

            DeleteRuleCommand = new DelegateCommand(() =>
            {
                CurrentRule.AccessRules.Remove(SelectedRule);
                CurrentRule.Validate();
            }, () => SelectedRule != null);

            SaveCommand = DelegateCommand.FromAsyncHandler(() => _executor.TryAsync(SaveRuleAsync).Finally(() =>
            {

            }).ExecuteAsync(), () => _isValid);

            CancelCommand = new DelegateCommand(() => _dialogService.Close(this, false), () => true);
        }

        private async Task SaveRuleAsync()
        {

            if (IsAdding)
            {
                var contract = CurrentRule.ToContract();
                var rule = await _webComponentService.AddResourceRuleAsync(contract);
                if (rule != null)
                {
                    await _dispatcher.InvokeAsync(() => _dialogService.Close(this, true));
                }
            }
            else
            {
                var contract = CurrentRule.ToContract();
                var rule = await _webComponentService.UpdateResourceRuleAsync(contract);
                if (rule != null)
                {
                    await _dispatcher.InvokeAsync(() => _dialogService.Close(this, true));
                }
            }
        }

        protected override async Task OnInitialize()
        {
            if (_initialize) return;

            _initialize = true;

            var metaData = await _webComponentService.GetModulesMetaDataAsync();

            await _dispatcher.BeginInvoke(
                new Action(() =>
                {
                    Categories.Clear();
                    metaData.Select(x => x.Name).ToList().ForEach(y => Categories.Add(y));

                    CurrentRule.Category =
                        Categories.FirstOrDefault(
                            x => x.Equals(CurrentRule.Category, StringComparison.OrdinalIgnoreCase));
                }));
            

            CurrentRule.OnAfterValidate((isValid, results) =>
            {
                _isValid = isValid && ValidateUnique(results);
                RefreshCommands();
            });

            CurrentRule.Validate();
        }

        private bool ValidateUnique(ICollection<ValidationResult> results)
        {
            CurrentRule.NotifyPatterns();
            if (CurrentRule.Patterns.Count <= 0)
            {
                results.Add(new ValidationResult("Rule should have alteast one pattern defined",
                    new List<string>(new[] {"Patterns"})));
                return false;
            }

            foreach (var resourceAuthorizationModel in NotAllowedRules)
            {
                if (
                    resourceAuthorizationModel.Patterns.Select(x => x.Value)
                        .SameElements(CurrentRule.Patterns.Select(x => x.Value)))
                {
                    results.Add(
                        new ValidationResult(
                            string.Format("The same set of patterns are already defined in Rule '{0}'",
                                resourceAuthorizationModel.Description), new List<string>(new[] {"Patterns"})));
                    return false;
                }
            }

            return true;
        }

        public ResourceAuthorizationModel CurrentRule
        {
            get { return GetProperty<ResourceAuthorizationModel>(); }
            set
            {
                SetProperty(value);
            }
        }

        public DelegateCommand AddPatternCommand { get; private set; }

        public DelegateCommand EditPatternCommand { get; private set; }

        public DelegateCommand DeletePatternCommand { get; private set; }

        public DelegateCommand AddRuleCommand { get; private set; }

        public DelegateCommand EditRuleCommand { get; private set; }

        public DelegateCommand DeleteRuleCommand { get; private set; }

        public DelegateCommand SaveCommand { get; private set; }

        public DelegateCommand CancelCommand { get; private set; }


        public ValidatableString SelectedPattern
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
                AddPatternCommand.RaiseCanExecuteChanged();
                EditPatternCommand.RaiseCanExecuteChanged();
                DeletePatternCommand.RaiseCanExecuteChanged();
                AddRuleCommand.RaiseCanExecuteChanged();
                EditRuleCommand.RaiseCanExecuteChanged();
                DeleteRuleCommand.RaiseCanExecuteChanged();
                SaveCommand.RaiseCanExecuteChanged();
                CancelCommand.RaiseCanExecuteChanged();
            }));
        }

        public AuthorizationRuleModel SelectedRule
        {
            get { return GetProperty<AuthorizationRuleModel>(); }
            set
            {
                SetProperty(value);
                RefreshCommands();
            }
        }

        
        public bool IsAdding { get; set; }

        public ValidatableString Current
        {
            get { return GetProperty<ValidatableString>(); }
            set
            {
                SetProperty(value);
                RefreshCommands();
            }
        }

        public ObservableCollection<string> Categories
        {
            get { return GetProperty<ObservableCollection<string>>(); }
            set { SetProperty(value); }
        }

        public IEnumerable<ResourceAuthorizationModel> NotAllowedRules { get; set; }

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
