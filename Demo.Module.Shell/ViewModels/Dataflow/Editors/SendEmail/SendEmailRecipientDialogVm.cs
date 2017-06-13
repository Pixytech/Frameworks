using System.Collections.ObjectModel;
using Graphnet.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure.Commands;
using Graphnet.Wpf.Presentation.Infrastructure.Services.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Dataflow.Editors.SendEmail
{
    public class SendEmailRecipientDialogVm : ValidatableViewModelBase
    {
        private readonly IDialogService _dialogService;
        private readonly IDispatcher _dispatcher;

        public SendEmailRecipientDialogVm(IDispatcher dispatcher, IDialogService dialogService)
        {
            _dispatcher = dispatcher;
            _dialogService = dialogService;


            var recipientTypes = new ObservableCollection<string>
            {
                "To",
                "Cc",
                "Bcc"
            };

            RecipientTypes = recipientTypes;

            SaveCommand = new DelegateCommand(() => _dialogService.Close(this, true),
                () =>
                    SelectedRecipient != null && SelectedRecipient.Recipient != null &&
                    Validate());

            CancelCommand = new DelegateCommand(() => _dialogService.Close(this, false), () => true);
        }


        public bool? Result { get; set; }

        public ObservableCollection<string> RecipientTypes
        {
            get { return GetProperty<ObservableCollection<string>>(); }
            set { SetProperty(value); }
        }

        public AggregatedRecipient SelectedRecipient
        {
            get { return GetProperty<AggregatedRecipient>(); }
            set
            {
                SetProperty(value);
                RefreshCommands();
            }
        }

        [EmailAddress(ErrorMessage = "Please enter an email address for this recipient" )]
        public string EmailAddress
        {
            get { return SelectedRecipient.Recipient.EmailAddress; }
            set
            {
                SetProperty(value);
                SelectedRecipient.Recipient.EmailAddress = value;
                SaveCommand.RaiseCanExecuteChanged();
            }
        }

        private void RefreshCommands()
        {
            _dispatcher.InvokeAsync(() =>
            {
                SaveCommand.RaiseCanExecuteChanged();
                CancelCommand.RaiseCanExecuteChanged();
            });
        }

        public DelegateCommand SaveCommand { get; private set; }
        public DelegateCommand CancelCommand { get; private set; }
    }
}
