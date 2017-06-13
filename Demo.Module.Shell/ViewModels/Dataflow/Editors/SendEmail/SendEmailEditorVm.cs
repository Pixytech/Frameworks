using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Windows;
using Graphnet.Core.IoC;
using Graphnet.Dashboard.WebContracts.Dataflow;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Dataflow;
using Graphnet.Wpf.Presentation.Infrastructure.Services.Interfaces;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Dataflow.Editors.SendEmail
{
   class SendEmailEditorVm : MiddlewareEditor
    {
       private readonly IMessageBoxService _messageBoxService;
       private bool _isInitialised;


       public SendEmailEditorVm(IMessageBoxService messageBoxService)
        {
           _messageBoxService = messageBoxService;
        }

       [Required(AllowEmptyStrings = false, ErrorMessage = "Email data is required")]
       public VariableModel EmailData
       {
           get { return GetProperty<VariableModel>(); }
           set
           {
               SetProperty(value);
               EmailOptionType = value.Type;
           }
       }

       public Type EmailOptionType
       {
           get { return GetProperty<Type>(); }
           set
           {
               if (ConfirmMessageTypeChange(value))
               {
                   if (SetProperty(value))
                   {
                       var messageType = value;
                       var sendEmailOptionType = typeof (SendEmailOptionsVm<>).MakeGenericType(messageType);

                       Container.Configure(sendEmailOptionType, ObjectLifecycle.InstancePerCall);

                       var options = Container.Build(sendEmailOptionType) as ISendEmailOptionsVm;
                       if (options == null)
                       {
                           throw new InvalidCastException("Unable to create instance of SendEmailOptionsVm");
                       }

                       options.RequestValidationAction = RequestValidationAction;

                       SendEmailOptions = options;

                       options.SelectEmailData(Variables.FirstOrDefault(x=>x.Name.Equals(EmailData.Name,StringComparison.OrdinalIgnoreCase)));

                       if (Context.MiddlewareOption == null)
                       {
                           Context.MiddlewareOption = options.MiddlewareOption;
                       }
                       else
                       {
                           if (options.MiddlewareOption != null &&
                               options.MiddlewareOption.GetType().IsAssignableFrom(Context.MiddlewareOptionType))
                           {
                               options.MiddlewareOption = Context.MiddlewareOption;

                           }
                           else
                           {
                               Context.MiddlewareOption = options.MiddlewareOption;
                           }
                       }

                       var isVariableCheckRequired = SendEmailOptions.IsVariableCheckRequired;
                       if (isVariableCheckRequired)
                       {
                           var previousValue = ((dynamic) SendEmailOptions.MiddlewareOption).EmailRequiredVariable;
                           if (previousValue != null)
                           {
                               var variable = BoolVariables.FirstOrDefault(
                                       x => x.Name.Equals(previousValue.Name, StringComparison.OrdinalIgnoreCase));

                               if (variable != null)
                                   SendEmailOptions.EmailRequiredVariable = variable;
                               else
                               {
                                   SendEmailOptions.ClearEmailRequiredVariable();
                               }
                           }
                       }
                       else
                       {
                           SendEmailOptions.ClearEmailRequiredVariable();
                       }

                        options.InitializeVm();
                   }
               }
           }
       }

       public IEnumerable<VariableModel> Variables
       {
           get
           {
               return Context.Variables.Where(x => typeof(IDataflowMessage).IsAssignableFrom(x.Type));
           }
       }

       public IEnumerable<VariableModel> BoolVariables
       {
           get
           {
               return Context.Variables.Where(x => typeof(bool).IsAssignableFrom(x.Type));
           }
       }

       private bool ConfirmMessageTypeChange(Type messageType)
        {
            if (SendEmailOptions != null && SendEmailOptions.MiddlewareOption!= null)
            {
                if (!SendEmailOptions.MiddlewareOption.GetType().GetGenericArguments().First().IsAssignableFrom(messageType) && SendEmailOptions.HasData)
                {
                    if (
                        _messageBoxService.Show(this,
                            "You are about to change the variable, This will reset the subject and email content",
                            "Confirm Action ?", MessageBoxButton.OKCancel, MessageBoxImage.Question) ==
                        MessageBoxResult.Cancel)
                    {
                        return false;
                    }
                }
            }
            return true;
        }

       public ISendEmailOptionsVm SendEmailOptions
        {
            get { return GetProperty<ISendEmailOptionsVm>(); }
            private set
            {
                SetProperty(value);
                OnPropertyChanged(()=>AllowEdits);
            }
        }

       public bool AllowEdits
       {
           get { return SendEmailOptions != null; }
          
       }

       protected override void OnCleanup()
       {
           Context.Variables.CollectionChanged -= OnVariablesChanged;           
       }

       protected override void OnInitializeEditor()
       {
           Context.Variables.CollectionChanged += OnVariablesChanged;           
           if (!_isInitialised)
           {
               if (Context.MiddlewareOption != null)
               {
                   var variable = ((dynamic) Context.MiddlewareOption).EmailData as Variable;
                   EmailData = Variables.FirstOrDefault(x => x.Name.Equals(variable.Name, StringComparison.OrdinalIgnoreCase));

               }
               _isInitialised = true;
           }
        }

       private void OnVariablesChanged(object sender, NotifyCollectionChangedEventArgs e)
       {
           if (e.Action == NotifyCollectionChangedAction.Add || e.Action == NotifyCollectionChangedAction.Remove ||
               e.Action == NotifyCollectionChangedAction.Reset)
           {
               OnPropertyChanged(() => Variables);
               OnPropertyChanged(() => BoolVariables);
           }
       }

       protected override IMiddlewareOptionBase OnGetMiddlewareOption()
       {
           return Context.MiddlewareOption;
       }

       protected override bool OnEditorValidate()
       {
           var selfValidate = base.OnEditorValidate();
           var childValidate = SendEmailOptions != null && SendEmailOptions.Validate();
           return selfValidate && childValidate;
       }

       protected override void OnActivateEditor()
       {
           OnPropertyChanged(() => EmailOptionType);
           OnPropertyChanged(() => EmailData);
           OnPropertyChanged(() => AllowEdits);
       }
    }
}
