using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Documents;
using Graphnet.Core.Utilities;
using Graphnet.Dashboard.CoreUI.Models;
using Graphnet.Dashboard.WebContracts.Dataflow;
using Graphnet.Dashboard.WebContracts.Dataflow.Metadata;
using Graphnet.Dashboard.WebContracts.Dataflow.Rules;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Dataflow;
using Graphnet.Core.IoC;
using Graphnet.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure.Services.Interfaces;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.ExceptionManagement;
using Graphnet.Dashboard.WebContracts;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Dataflow.Editors.Ruleset
{
    internal class RuleSetEditorVm : MiddlewareEditor
    {
        private readonly IBuilder _builder;
        private readonly ISafeExecutor _safeExecutor;
        private readonly IMessageBoxService _messageBoxService;
        private readonly IWebComponentService _webComponentService;
        private readonly IDispatcher _dispatcher;

        public Type MiddlewareOptionType { get; set; }

        public RuleSetEditorVm(IBuilder builder, ISafeExecutor safeExecutor, IMessageBoxService messageBoxService, IWebComponentService webComponentService, IDispatcher dispatcher)
        {
            _builder = builder;
            _safeExecutor = safeExecutor;
            _messageBoxService = messageBoxService;
            _webComponentService = webComponentService;
            _dispatcher = dispatcher;
        }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Rule context is required")]
        public MessageMetadataModel MessageType
        {
            get { return GetProperty<MessageMetadataModel>(); }
            set
            {
                if (ConfirmMessageTypeChange(value))
                {
                    SetProperty(value);

                    _dispatcher.Invoke(new Action(CreateRuleOptions));
                }

                base.Validate();
            }
        }

        private void CreateRuleOptions()
        {
            if (MessageType != null)
            {
                var messageType = MessageType.Metadata.MessageType;
                var ruleOptionType = typeof (RuleOptionVm<>).MakeGenericType(messageType);

                Container.Configure(ruleOptionType, ObjectLifecycle.InstancePerCall);

                var options = Container.Build(ruleOptionType) as IRuleOptionsVm;

                if (options == null)
                {
                    throw new InvalidCastException("Unable to create instance of RuleOptionsVm");
                }

                options.RequestValidationAction = RequestValidationAction;

                options.VariableProvider = VariableProvider;

                if (Context.MiddlewareOption == null)
                {
                    Context.MiddlewareOption = options.MiddlewareOption;
                }
                else
                {
                    if (options.MiddlewareOption.GetType().IsAssignableFrom(Context.MiddlewareOptionType))
                    {
                        options.MiddlewareOption = Context.MiddlewareOption;
                    }
                    else
                    {
                        Context.MiddlewareOption = options.MiddlewareOption;
                    }
                }

                AssignAvailableActionsMetaDataByType(options, messageType);
                AssignAvailableConditionsMetaDataByType(options, messageType);

                RuleOptions = options;
            }
            else
            {
                RuleOptions = null;
            }
        }

        private void AssignAvailableActionsMetaDataByType(IRuleOptionsVm options, Type messageType)
        {
            var actionType = typeof(IAction<>).MakeGenericType(messageType);
            var result = new List<ActionsMetadata>();

            foreach (var actionMetadata in AvailableActionsMetadata)
            {
                if (actionMetadata.ActionType.IsGenericType)
                {
                    if (actionType.IsAssignableFrom(actionMetadata.ActionType.MakeGenericType(messageType)))
                    {

                        var action = (ActionsMetadata) actionMetadata.Clone();
                        action.ActionType = actionMetadata.ActionType.MakeGenericType(messageType);                        
                        result.Add(action);
                    }
                }
                else
                {
                    if (actionType.IsAssignableFrom(actionMetadata.ActionType))
                    {
                        result.Add((ActionsMetadata)actionMetadata.Clone());
                    }
                }
            }

            options.AvailableActionsMetadata = result; 
        }

        private void AssignAvailableConditionsMetaDataByType(IRuleOptionsVm options, Type messageType)
        {
            var conditionType = typeof(ICondition<>).MakeGenericType(messageType);
            var result = new List<ConditionsMetadata>();

            foreach (var conditionsMetadata in AvailableConditionsMetadata)
            {
                if (conditionsMetadata.ConditionType.IsGenericType)
                {
                    if (conditionType.IsAssignableFrom(conditionsMetadata.ConditionType.MakeGenericType(messageType)))
                    {
                        var condition = (ConditionsMetadata) conditionsMetadata.Clone();
                        condition.ConditionType = conditionsMetadata.ConditionType.MakeGenericType(messageType);
                        result.Add(condition);
                    }
                }
                else
                {
                    if (conditionType.IsAssignableFrom(conditionsMetadata.ConditionType))
                    {
                        result.Add((ConditionsMetadata) conditionsMetadata.Clone());
                    }
                }
            }

            options.AvailableConditionsMetadata = result;
        }

        private bool ConfirmMessageTypeChange(MessageMetadataModel messageType)
        {
            if (RuleOptions != null)
            {
                if (!RuleOptions.MiddlewareOption.GetType().GetGenericArguments().First().IsAssignableFrom(messageType.Metadata.MessageType) && RuleOptions.HasData)
                {
                    if (
                        _messageBoxService.Show(this,
                            "You are about to change the message type, This will reset the conditions and actions.",
                            "Confirm Action ?", MessageBoxButton.OKCancel, MessageBoxImage.Question) ==
                        MessageBoxResult.Cancel)
                    {
                        return false;
                    }
                }
            }
            return true;
        }

        public IRuleOptionsVm RuleOptions
        {
            get { return GetProperty<IRuleOptionsVm>(); }
            private set
            {
                SetProperty(value);
                OnPropertyChanged(() => AllowEdits);
            }
        }

        public bool AllowEdits
        {
            get { return RuleOptions != null; }
        }

        protected override void OnInitializeEditor()
        {
            MessageTypes = new ObservableCollection<MessageMetadataModel>(AvailableMessageMetadata.ToModel());
            if (Context.MiddlewareOption != null)
            {
                var messageType = Context.MiddlewareOptionType.GetGenericArguments().FirstOrDefault();
                MessageType = MessageTypes.FirstOrDefault(x => x.Metadata.MessageType.IsAssignableFrom(messageType)) ??
                              MessageTypes.FirstOrDefault();
            }
        }

        protected override bool OnEditorValidate()
        {
            var selfValidate = base.OnEditorValidate();
            var childValidate = RuleOptions != null && RuleOptions.Validate();
            return selfValidate && childValidate;
        }
        
        public ObservableCollection<MessageMetadataModel> MessageTypes
        {
            get { return GetProperty<ObservableCollection<MessageMetadataModel>>(); }
            set
            {
                SetProperty(value);
            }
        }

        protected override void OnActivateEditor()
        {
            OnPropertyChanged(() => MessageTypes);
            OnPropertyChanged(() => MessageType);
            OnPropertyChanged(()=>RuleOptions);
            OnPropertyChanged(() => AllowEdits);
        }

        protected override IMiddlewareOptionBase OnGetMiddlewareOption()
        {
            RuleOptions.PrepareForSave();
            return RuleOptions.MiddlewareOption;
        }
    }
}
