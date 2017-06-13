using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Graphnet.Dashboard.Hub.Models;
using Graphnet.Dashboard.WebContracts.Security;
using Graphnet.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure.Commands;
using Graphnet.Wpf.Presentation.Infrastructure.Services.Interfaces;
using Graphnet.Wpf.Presentation.Services;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Security
{
    class PatternEditWindowVm : ValidatableViewModelBase
    {
        private readonly IDialogService _dialogService;
        private bool _isValid;
        private readonly IDispatcher _dispatcher;

        public PatternEditWindowVm(IDialogService dialogService, IDispatcher dispatcher, WebResourceValuesProvider webResourceValuesProvider)
        {
            _dialogService = dialogService;
            _dispatcher = dispatcher;
            WebResourceValuesProvider = webResourceValuesProvider;
            SaveCommand = new DelegateCommand(() => _dialogService.Close(this, true), () => _isValid);
            CancelCommand = new DelegateCommand(() => _dialogService.Close(this, false), () => true);
        }

        public DelegateCommand SaveCommand { get; private set; }

        public DelegateCommand CancelCommand { get; private set; }

        public WebResourceValuesProvider WebResourceValuesProvider { get; private set; }

        public ValidatableString Current
        {
            get { return GetProperty<ValidatableString>(); }
            set { SetProperty(value); }
        }

        public WebResource SelectedWebResource
        {
            get { return GetProperty<WebResource>(); }
            set { SetProperty(value); }
        }

        protected override async Task OnInitialize()
        {
            Current.OnAfterValidate((isValid,results) =>
            {
                _isValid = isValid && ValidateUnique(results);
                RefreshCommands();
            });
            Current.Validate();
            await base.OnInitialize();
        }

        private bool ValidateUnique(ICollection<ValidationResult> results)
        {
            if (NotAllowedNames != null && NotAllowedNames.FirstOrDefault(x => x.Equals(Current.Value,StringComparison.OrdinalIgnoreCase)) != null)
            {
                results.Add(new ValidationResult("Pattern already exists.",
                    new List<string>(new[] {"Value"})));
                return false;
            }

            return true;
        }

        private void RefreshCommands()
        {
            _dispatcher.BeginInvoke(new Action(() =>
            {
                SaveCommand.RaiseCanExecuteChanged();
                CancelCommand.RaiseCanExecuteChanged();
            }));
        }

        public List<string> NotAllowedNames { get; set; }

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
