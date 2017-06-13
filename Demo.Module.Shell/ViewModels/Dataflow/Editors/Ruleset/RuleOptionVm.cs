using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Threading;
using Graphnet.Core.IoC;
using Graphnet.Dashboard.WebContracts;
using Graphnet.Dashboard.WebContracts.Dataflow;
using Graphnet.Dashboard.WebContracts.Dataflow.Metadata;
using Graphnet.Dashboard.WebContracts.Dataflow.MiddlewareOptions;
using Graphnet.Dashboard.WebContracts.Dataflow.Rules;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Dataflow;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.ExceptionManagement;
using Graphnet.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure.Commands;
using Graphnet.Dashboard.CoreUI.ViewModels.Dataflow.Editors.Dialogs;
using Graphnet.Wpf.Presentation.Infrastructure.Services.Interfaces;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Dataflow.Editors.Ruleset
{
    internal class RuleOptionVm<T> : ValidatableViewModelBase,  IRuleOptionsVm where T: IDataflowMessage
    {
        private readonly IDispatcher _dispatcher;
        private readonly ISafeExecutor _safeExecutor;
        private readonly IWebComponentService _webComponentService;
        private readonly IMessageBoxService _messageBoxService;

        public IEnumerable<ConditionsMetadata> AvailableConditionsMetadata { get; set; }
        public IEnumerable<ActionsMetadata> AvailableActionsMetadata { get; set; }

        public RuleOptionVm(IDispatcher dispatcher, ISafeExecutor safeExecutor, IWebComponentService webComponentService, IBuilder builder, IMessageBoxService messageBoxService)
        {

            _dispatcher = dispatcher;
            _safeExecutor = safeExecutor;
            _webComponentService = webComponentService;
            _messageBoxService = messageBoxService;

            Conditions = new ObservableCollection<AnnotatedCondition>();
            IfActions = new ObservableCollection<AnnotatedAction>();
            ElseActions = new ObservableCollection<AnnotatedAction>();
            ConditionNext = new ObservableCollection<AnnotatedCondition>();
            RuleOptions = new RuleOptions<T>();

            AddConditionCommand = new DelegateCommand(() =>
            {
                var addToRuleSetModel = builder.Build<AddToRuleSetVm>();
                addToRuleSetModel.SetCondition(AvailableConditionsMetadata);

                if (!addToRuleSetModel.GetInput(string.Format("Add a Condition"))) return;

                // OK We have something. Let's add it.
                var result = (ConditionsMetadata) addToRuleSetModel.SelectedComponentResult;

                var instance = Activator.CreateInstance( result.ConditionType);
                var condition = new AnnotatedCondition
                {
                    Condition = (ICondition) instance,
                    Details = GetForCondition((ICondition) instance)
                };
                Conditions.Add(condition);
                SelectedCondition = condition;
                RequestValidation();

            }, () => true);

            DeleteConditionCommand = new DelegateCommand(() =>
            {
                if (_messageBoxService.Show(this,
                    string.Format("Do you want to delete the Condition?\n\r" ),
                    "Confirm action", MessageBoxButton.YesNo, MessageBoxImage.Question) == MessageBoxResult.Yes)
                {
                    Conditions.Remove(SelectedCondition);
                    RequestValidation();
                }
            }, () => SelectedCondition != null);


            AddIfActionCommand = new DelegateCommand(() =>
            {
                var addToRuleSetModel = builder.Build<AddToRuleSetVm>();
                addToRuleSetModel.SetAction(AvailableActionsMetadata);

                if (!addToRuleSetModel.GetInput(string.Format("Add an Action"))) return;

                // OK We have something. Let's add it.
                var result = (ActionsMetadata) addToRuleSetModel.SelectedComponentResult;

                var instance = Activator.CreateInstance(result.ActionType);
                var action = new AnnotatedAction
                {
                    Action = (IAction) instance,
                    Details = GetForAction((IAction) instance)
                };
                IfActions.Add(action);
                SelectedIfAction = action;
                RequestValidation();
            }, () => true);

            
            DeleteIfActionCommand = new DelegateCommand(() =>
            {
                if (_messageBoxService.Show(this,
                    string.Format("Do you want to delete the If Action?\n\r"),
                    "Confirm action", MessageBoxButton.YesNo, MessageBoxImage.Question) == MessageBoxResult.Yes)
                {
                    IfActions.Remove(SelectedIfAction);
                    RequestValidation();
                }
            }, () => SelectedIfAction != null);


            AddElseActionCommand = new DelegateCommand(() =>
            {
                var addToRuleSetModel = builder.Build<AddToRuleSetVm>();
                addToRuleSetModel.SetAction(AvailableActionsMetadata);

                if (!addToRuleSetModel.GetInput(string.Format("Add an Else Action"))) return;

                // OK We have something. Let's add it.
                var result = (ActionsMetadata)addToRuleSetModel.SelectedComponentResult;

                var instance = Activator.CreateInstance(result.ActionType);
                var action = new AnnotatedAction
                {
                    Action = (IAction) instance,
                    Details = GetForAction((IAction) instance)
                };
                ElseActions.Add(action);
                SelectedElseAction = action;
                RequestValidation();
            }, () => true);

            DeleteElseActionCommand = new DelegateCommand(() =>
            {
                if (_messageBoxService.Show(this,
                    string.Format("Do you want to delete the Else Action?\n\r"),
                    "Confirm action", MessageBoxButton.YesNo, MessageBoxImage.Question) == MessageBoxResult.Yes)
                {
                    ElseActions.Remove(SelectedElseAction);
                    RequestValidation();
                }
            }, () => SelectedElseAction != null);


            AddContinueCommand = new DelegateCommand(() =>
            {
                var addToRuleSetModel = builder.Build<AddToRuleSetVm>();
                addToRuleSetModel.SetCondition(AvailableConditionsMetadata);

                if (!addToRuleSetModel.GetInput(string.Format("Add a Continue Condition"))) return;

                // OK We have something. Let's add it.
                var result = (ConditionsMetadata)addToRuleSetModel.SelectedComponentResult;

                var instance = Activator.CreateInstance(result.ConditionType);
                var condition = new AnnotatedCondition
                {
                    Condition = (ICondition) instance,
                    Details = GetForCondition((ICondition) instance)
                };
                ConditionNext.Add(condition);
                SelectedConditionNext = condition;
                RequestValidation();
            }, () => true);

            DeleteContinueCommand = new DelegateCommand(() =>
            {
                if (_messageBoxService.Show(this,
                    string.Format("Do you want to delete the Continue Condition?\n\r"),
                    "Confirm action", MessageBoxButton.YesNo, MessageBoxImage.Question) == MessageBoxResult.Yes)
                {
                    ConditionNext.Remove(SelectedConditionNext);
                    RequestValidation();
                }
            }, () => SelectedConditionNext != null);
        }

        public ObservableCollection<AnnotatedCondition> Conditions
        {
            get { return GetProperty<ObservableCollection<AnnotatedCondition>>(); }
            private set { SetProperty(value); }
        }

        public ObservableCollection<AnnotatedAction> IfActions
        {
            get { return GetProperty<ObservableCollection<AnnotatedAction>>(); }
            private set { SetProperty(value); }
        }
        public ObservableCollection<AnnotatedAction> ElseActions
        {
            get { return GetProperty<ObservableCollection<AnnotatedAction>>(); }
            private set { SetProperty(value); }
        }
        public ObservableCollection<AnnotatedCondition> ConditionNext  {
            get { return GetProperty<ObservableCollection<AnnotatedCondition>>(); }
            private set { SetProperty(value); }
        }

        private void SelectPropertyExplorer(int value)
        {
            object selectedProperty = null;
            switch (value)
            {
                case 0: // Conditions
                    if (SelectedCondition == null) SelectedCondition = Conditions.FirstOrDefault();
                    if (SelectedCondition != null) selectedProperty = SelectedCondition.Condition;
                    break;
                case 1: // Actions
                    if (SelectedIfAction == null) SelectedIfAction = IfActions.FirstOrDefault();
                    if (SelectedIfAction != null) selectedProperty = SelectedIfAction.Action;
                    break;
                case 2: // ElseActions
                    if (SelectedElseAction == null) SelectedElseAction = ElseActions.FirstOrDefault();
                    if (SelectedElseAction != null) { selectedProperty = SelectedElseAction.Action; }
                    break;
                case 3: // Continue Condition
                    if (SelectedConditionNext == null) SelectedConditionNext = ConditionNext.FirstOrDefault();
                    if (SelectedConditionNext != null) selectedProperty = SelectedConditionNext.Condition;
                    break;
            }

            SelectedObject = selectedProperty;
        }

        public int SelectedTabIndex
        {
            get { return GetProperty<int>(); }
            set
            {
                SetProperty(value);
                SelectPropertyExplorer(value);
            }
        }

        public AnnotatedAction SelectedIfAction
        {
            get { return GetProperty<AnnotatedAction>(); }
            set
            {
                SetProperty(value);

                SelectedObject = value!= null ? value.Action : null;

                RefreshCommands();
            }
        }

        public AnnotatedAction SelectedElseAction
        {
            get { return GetProperty<AnnotatedAction>(); }
            set
            {
                SetProperty(value);
                SelectedObject = value != null ? value.Action : null;
                RefreshCommands();
            }
        }

        public AnnotatedCondition SelectedCondition
        {
            get { return GetProperty<AnnotatedCondition>(); }
            set
            {
                SetProperty(value);
                SelectedObject = value != null ? value.Condition : null;
                RefreshCommands();
            }
        }

        public AnnotatedCondition SelectedConditionNext
        {
            get { return GetProperty<AnnotatedCondition>(); }
            set
            {
                SetProperty(value);
                SelectedObject = value != null ? value.Condition : null;
                RefreshCommands();
            }
        }

        public Object SelectedObject
        {
            get { return GetProperty<Object>(); }
            set { SetProperty(value); }
        }

        private void RefreshCommands()
        {
            _dispatcher.InvokeAsync(() =>
            {
                AddConditionCommand.RaiseCanExecuteChanged();
                DeleteConditionCommand.RaiseCanExecuteChanged();
                AddIfActionCommand.RaiseCanExecuteChanged();
                DeleteIfActionCommand.RaiseCanExecuteChanged();
                AddElseActionCommand.RaiseCanExecuteChanged();
                DeleteElseActionCommand.RaiseCanExecuteChanged();
                AddContinueCommand.RaiseCanExecuteChanged();
                DeleteContinueCommand.RaiseCanExecuteChanged();
            });
        }

        protected override async Task OnInitialize()
        {
            Conditions = new ObservableCollection<AnnotatedCondition>(RuleOptions.IfConditions.Select(condition => new AnnotatedCondition {Condition = condition, Details = GetForCondition(condition)}));
            IfActions = new ObservableCollection<AnnotatedAction>(RuleOptions.Actions.Select(action => new AnnotatedAction { Action = action, Details = GetForAction(action) }));
            ElseActions = new ObservableCollection<AnnotatedAction>(RuleOptions.ElseActions.Select(action => new AnnotatedAction { Action = action, Details = GetForAction(action) }));
            ConditionNext = new ObservableCollection<AnnotatedCondition>(RuleOptions.ConditionNext.Select(condition => new AnnotatedCondition { Condition = condition, Details = GetForCondition(condition) }));

            SelectedTabIndex = 0;
            await base.OnInitialize();
        }

        public RuleOptions<T> RuleOptions { get; set; } 

       
        private ConditionsMetadata GetForCondition(ICondition condition)
        {
            return
                AvailableConditionsMetadata.FirstOrDefault(cm => cm.ConditionType == condition.GetType());
        }

        private ActionsMetadata GetForAction(IAction action)
        {
            return
                AvailableActionsMetadata.FirstOrDefault(am => am.ActionType == action.GetType());
        }


        public AnnotatedCondition ContinueCondition
        {
            get { return GetProperty<AnnotatedCondition>(); }
            set
            {
                SetProperty(value);
                RefreshCommands();
            }
        }

        // Commands

        public DelegateCommand AddConditionCommand { get; private set; }
        public DelegateCommand DeleteConditionCommand { get; private set; }

        public DelegateCommand AddIfActionCommand { get; private set; }
        public DelegateCommand DeleteIfActionCommand { get; private set; }

        public DelegateCommand AddElseActionCommand { get; private set; }
        public DelegateCommand DeleteElseActionCommand { get; private set; }

        public DelegateCommand AddContinueCommand { get; private set; }
        public DelegateCommand DeleteContinueCommand { get; private set; }

        public void PrepareForSave()
        {
            RuleOptions.IfConditions.Clear();
            RuleOptions.Actions.Clear();
            RuleOptions.ElseActions.Clear();
            RuleOptions.ConditionNext.Clear();

            foreach (var condition in Conditions)
            {
                RuleOptions.IfConditions.Add(condition.Condition as ICondition<T>);

            }
            foreach (var action in IfActions)
            {
                RuleOptions.Actions.Add(action.Action as IAction<T>);
            }

            foreach (var action in ElseActions)
            {
                RuleOptions.ElseActions.Add(action.Action as IAction<T>);
            }

            foreach (var condition in ConditionNext)
            {
                RuleOptions.ConditionNext.Add(condition.Condition as ICondition<T>);
            }
        }
        public IMiddlewareOptionBase MiddlewareOption
        {
            get
            {
                return RuleOptions;
            }

            set { RuleOptions = value as RuleOptions<T>; }
        }


        public bool HasData
        {
            get { return Conditions.Any() || IfActions.Any() || ElseActions.Any() || ConditionNext.Any(); }
        }

        public async Task InitializeVm()
        {
            await Initialize();
            
            RequestValidation();
        }

        public IVariableProvider VariableProvider { get; set; }

        public Action RequestValidationAction { get; set; }

        public void RequestValidation()
        {
            RequestValidationAction.Invoke();
        }

    }
}
