using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Threading;
using Graphnet.Core.IoC;
using Graphnet.Dashboard.CoreUI.Reflection;
using Graphnet.Dashboard.WebContracts.Dataflow;
using Graphnet.Dashboard.WebContracts.Dataflow.MiddlewareOptions;
using Graphnet.Dashboard.WebContracts.Dataflow.TemplateParsing;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Dataflow;
using Graphnet.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure.Commands;
using Graphnet.Wpf.Presentation.Infrastructure.Services.Interfaces;
using Graphnet.Wpf.Presentation.Services;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Dataflow.Editors.SendEmail
{
    internal class SendEmailOptionsVm<T> : ValidatableViewModelBase, ISendEmailOptionsVm where T : IDataflowMessage
    {
        private readonly IDispatcher _dispatcher;
        private readonly IMessageBoxService _messageBoxService;
        private readonly ObservableCollection<ContextData> _contextFields = new ObservableCollection<ContextData>();
        
        private bool _forceClear;



        public SendEmailOptionsVm(IDispatcher dispatcher, IBuilder builder, IDialogService dialogService, IMessageBoxService messageBoxService)
        {
            _dispatcher = dispatcher;
            _messageBoxService = messageBoxService;
            Recipients = new ObservableCollection<AggregatedRecipient>();
            MiddlewareOptions = new SendEmailOptions<T>();
            MiddlewareOptions.Template = new EmailMessageDefinition(){Body="",Subject = ""};

            AddVariableCommand = new DelegateCommand<string>(variable =>
            {

                Body = Body.Insert(BodyCaretIndex, variable);

                BodyCaretIndex = BodyCaretIndex + variable.Length;

            }, v => !string.IsNullOrEmpty(v));

            AddVariableSubjectCommand = new DelegateCommand<string>(variable =>
            {

                Subject = Subject.Insert(SubjectCaretIndex, variable);

                SubjectCaretIndex = SubjectCaretIndex + variable.Length;

            }, v => !string.IsNullOrEmpty(v));



            AddRecipientCommand = new DelegateCommand(() =>
            {
                // Collect recipient details
                var recipientDialog = builder.Build<SendEmailRecipientDialogVm>();
                recipientDialog.SelectedRecipient = new AggregatedRecipient
                {
                    RecipientType = "To",
                    Recipient = new EmailRecipient { EmailAddress = "" }
                };

                if (dialogService.ShowDialog(recipientDialog,
                    new DialogOptions
                    {
                        ActivateParentAfterClose = true,
                        AutoHideHeader = false,
                        IsHeaderVisible = true,
                        IsTitleVisible = true,
                        Title = "Add new Recipient"
                    }) == true)
                {
                    // Remove anyone with the same Email Address from any of the recipient lists.
                    // Add the recipient to the selected list.
                    RemoveEmailFromList(recipientDialog.SelectedRecipient.Recipient.EmailAddress);
                    Recipients.Add(recipientDialog.SelectedRecipient);
                    UpdateOptionsRecipients(Recipients, MiddlewareOptions);
                    RequestValidation();

                    

                }
            }, () => true);

            new DispatcherTimer(TimeSpan.FromSeconds(1), DispatcherPriority.Background, delegate { dispatcher.InvokeAsync(() => Validate(), DispatcherPriority.Background); },
                Dispatcher.CurrentDispatcher).Start();

            EditRecipientCommand = new DelegateCommand(() =>
            {
                var recipientDialog = builder.Build<SendEmailRecipientDialogVm>();
                recipientDialog.SelectedRecipient = SelectedRecipient;

                if (dialogService.ShowDialog(recipientDialog,
                    new DialogOptions
                    {
                        ActivateParentAfterClose = true,
                        AutoHideHeader = false,
                        IsHeaderVisible = true,
                        IsTitleVisible = true,
                        Title = "Edit Recipient"
                    }) == true)
                {
                    // Remove anyone with the same Email Address from any of the recipient lists.
                    // Add the recipient to the selected list.
                    RemoveEmailFromList(recipientDialog.SelectedRecipient.Recipient.EmailAddress);
                    Recipients.Add(recipientDialog.SelectedRecipient);
                    UpdateOptionsRecipients(Recipients, MiddlewareOptions);
                    RequestValidation();
                }
            }, () => SelectedRecipient != null);

            DeleteRecipientCommand = new DelegateCommand(() =>
            {
                // Launch the model window to edit the selected segment
                // on save restart & refresh and on cancel do nothing
                string previousRecipientEmail = SelectedRecipient.Recipient.EmailAddress;

                if (_messageBoxService.Show(this,
                    string.Format("Do you want to remove this recipient ({0}) from the message?", previousRecipientEmail),
                    "Confirm action", MessageBoxButton.YesNo, MessageBoxImage.Question) == MessageBoxResult.Yes)
                {
                    // Remove anyone with the same Email Address from any of the recipient lists.
                    // Add the recipient to the selected list.
                    RemoveEmailFromList(previousRecipientEmail);
                    UpdateOptionsRecipients(Recipients, MiddlewareOptions);
                    RequestValidation();
                }
            }, () => SelectedRecipient != null);

            //Validate();
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

        private void RefreshCommands()
        {
            _dispatcher.InvokeAsync(() =>
            {
                AddRecipientCommand.RaiseCanExecuteChanged();
                EditRecipientCommand.RaiseCanExecuteChanged();
                DeleteRecipientCommand.RaiseCanExecuteChanged();
            });
        }

        private void RemoveEmailFromList(string emailAddress)
        {
            Recipients.Where(x => x.Recipient.EmailAddress.Equals(emailAddress, StringComparison.OrdinalIgnoreCase))
                .ToList()
                .ForEach(x => Recipients.Remove(x));
                }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Please enter an email subject")]
        [MinLength(3)]
        public string Subject
        {
            get { return MiddlewareOptions.Template.Subject; }
            set
            {
                MiddlewareOptions.Template.Subject = value;
                OnPropertyChanged(() => Subject);
                RequestValidation();
            }
        }

        public string From
        {
            get { return MiddlewareOptions.From; }
            set
            {
                MiddlewareOptions.From = value;
                OnPropertyChanged(() => From);
                RequestValidation();
            }
        }

        public bool IsContextAvailable
        {
            get { return GetProperty<bool>(); }
            set { SetProperty(value); }
        }

        public bool IsVariableCheckRequired
        {
            get { return MiddlewareOptions.IsVariableCheckRequired; }
            set
            {
                MiddlewareOptions.IsVariableCheckRequired = value;
                if (!value)
                {
                    EmailRequiredVariable = null;
                }
                OnPropertyChanged(()=>IsVariableCheckRequired);
                RequestValidation();
            }
        }

        public VariableModel EmailRequiredVariable
        {
            get { return GetProperty<VariableModel>(); }
            set
            {

                if (value != null || _forceClear)
                {
                    SetProperty(value);

                    if (value != null)
                    {
                        MiddlewareOptions.EmailRequiredVariable = value.ToContract() as Variable<bool>;
                    }
                    else
                    {
                        MiddlewareOptions.EmailRequiredVariable = null;
                    }
                    RequestValidation();

                }


            }
        }

        public VariableModel EmailData
        {
            get { return MiddlewareOptions.EmailData.ToModel(); }
            set { MiddlewareOptions.EmailData = value.ToContract() as Variable<T>; }
        }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Please provide a body template for the email message")]
        [MinLength(3)]
        public string Body
        {
            get { return MiddlewareOptions.Template.Body; }
            set
            {
                MiddlewareOptions.Template.Body = value;
                OnPropertyChanged(() => Body);
                RequestValidation();
            }
        }

        public ObservableCollection<ContextData> ContextFields
        {
            get { return _contextFields; }
        }

        protected override async Task OnInitialize()
        {
            await _dispatcher.InvokeAsync(()=>SetDataType(typeof(T)));
            
            await base.OnInitialize();
        }

        private static void UpdateOptionsRecipients(IEnumerable<AggregatedRecipient> recipients, SendEmailOptions<T> options)
        {
            var recipientsList = recipients.ToList();
            options.ToRecipients = recipientsList.Where(x => x.RecipientType == "To").Select(x => x.Recipient).ToList();
            options.CcRecipients = recipientsList.Where(x => x.RecipientType == "Cc").Select(x => x.Recipient).ToList();
            options.BccRecipients = recipientsList.Where(x => x.RecipientType == "Bcc").Select(x => x.Recipient).ToList();
        }

        private static IEnumerable<AggregatedRecipient> GetRecipientsFromOptions(SendEmailOptions<T> options)
        {
            var list =
                new List<EmailRecipient>(options.ToRecipients ?? new List<EmailRecipient>()).Select(
                    t => new AggregatedRecipient {Recipient = t, RecipientType = "To"}).ToList();
            list.AddRange(
                new List<EmailRecipient>(options.CcRecipients ?? new List<EmailRecipient>()).Select(
                    c => new AggregatedRecipient {Recipient = c, RecipientType = "Cc"}));
            list.AddRange(
                new List<EmailRecipient>(options.BccRecipients ?? new List<EmailRecipient>()).Select(
                    b => new AggregatedRecipient {Recipient = b, RecipientType = "Bcc"}));
            return list;
        }

        public ObservableCollection<AggregatedRecipient> Recipients
        {
            get { return GetProperty<ObservableCollection<AggregatedRecipient>>(); }
            set
            {
                SetProperty(value);
            }
        }

        protected override bool OnValidate(ICollection<ValidationResult> validationResults)
       {
            if (!Recipients.Any())
            {
                validationResults.Add(new ValidationResult("Atleast one recipent is required", new List<string>(new[] { "Recipients" })));
                return false;
            }

           if (IsVariableCheckRequired)
           {
               if (EmailRequiredVariable == null)
               {
                   validationResults.Add(new ValidationResult("Please select boolean variable to check if email is required or not", new List<string>(new[] { "EmailRequiredVariable" })));
                   return false;
               }
           }

           return base.OnValidate(validationResults);
       }

        public Type SetDataType(Type dataType)
        {
            _contextFields.Clear();
            var props = PropertyInspector.GetPropertiesForType(dataType, null, "Model");
            props.ForEach(p => _contextFields.Add(new ContextData {Name = p, Value = string.Format("{0}", p)}));

            OnPropertyChanged(() => ContextFields);

            return dataType;
        }


        public string EmailAddress
        {
            get
            {
                //return GetProperty<string>(); 

                return SelectedRecipient.Recipient.EmailAddress;
            }
            set
            {
                var recipient = new EmailRecipient
                {
                    EmailAddress = SelectedRecipient.Recipient.EmailAddress,
                    Name = SelectedRecipient.Recipient.Name,
                    Phone = SelectedRecipient.Recipient.Phone
                };
                recipient.EmailAddress = value;
                SelectedRecipient.Recipient = recipient;
                SetProperty(value);
                RequestValidation();
                RefreshCommands();
            }
        }

        public DelegateCommand AddRecipientCommand { get; private set; }
        public DelegateCommand EditRecipientCommand { get; private set; }
        public DelegateCommand DeleteRecipientCommand { get; private set; }
        public DelegateCommand<string> AddVariableCommand { get; private set; }
        
        public int BodyCaretIndex
        {
            get { return GetProperty<int>(); }
            set { SetProperty(value); }
        }

        public DelegateCommand<string> AddVariableSubjectCommand { get; set; }

        public int SubjectCaretIndex
        {
            get { return GetProperty<int>(); }
            set { SetProperty(value); }
        }

        public IMiddlewareOptionBase MiddlewareOption
        {
            get { return MiddlewareOptions; }
            set
            {
                MiddlewareOptions = value as SendEmailOptions<T>;
                RequestValidation();
            }
        }

        public void SelectEmailData(VariableModel variable)
        {
            EmailData = variable;
        }
        
        public bool HasData
        {
            get { return !string.IsNullOrEmpty(Subject) || string.IsNullOrEmpty(Body); }
        }

        public SendEmailOptions<T> MiddlewareOptions { get; set; }


        public async Task InitializeVm()
        {
            await Initialize();
            await _dispatcher.InvokeAsync(() => Recipients = new ObservableCollection<AggregatedRecipient>(GetRecipientsFromOptions(MiddlewareOptions)));
            RequestValidation();
        }

        public Action RequestValidationAction { get; set; }

        public void RequestValidation()
        {
            RequestValidationAction.Invoke();
        }


        public void ClearEmailRequiredVariable()
        {
            _forceClear = true;
            EmailRequiredVariable = null;
            _forceClear = false;
        }
    }
}
