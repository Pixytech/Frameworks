using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using Graphnet.Core.IoC;
using Graphnet.Dashboard.CoreUI.Models;
using Graphnet.Dashboard.WebContracts;
using Graphnet.Dashboard.WebContracts.Dataflow.Metadata;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Dataflow;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.ExceptionManagement;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Helpers;
using Graphnet.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure.Commands;
using Graphnet.Wpf.Presentation.Infrastructure.Services.Interfaces;
using Graphnet.Wpf.Presentation.Services;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Dataflow
{
    class RuleEditorVm : ValidatableViewModelBase
    {
        private readonly IDispatcher _dispatcher;
        private readonly IDialogService _dialogService;
        private readonly ISafeExecutor _executor;
        private readonly IWebComponentService _webComponentService;
        private bool _isInitialised;

        private readonly IMessageBoxService _messageBoxService;
        
        public SegmentModel CurrentSegment
        {
            get { return GetProperty<SegmentModel>(); }
            set { SetProperty(value); }
        }

        public RuleEditorVm(IDispatcher dispatcher, IDialogService dialogService, IBuilder builder, ISafeExecutor executor, IWebComponentService webComponentService , IMessageBoxService messageBoxService)
        {
            _dispatcher = dispatcher;
            _dialogService = dialogService;
            _executor = executor;
            _webComponentService = webComponentService;
            _messageBoxService = messageBoxService;
            Categories = new ObservableCollection<string>();
            MessageMetadatas = new ObservableCollection<MessageMetadataModel>();

            LaunchWorkflowCommand = new DelegateCommand(() =>
            {
                var workflowEditor = builder.Build<WorkflowEditorVm>();
                workflowEditor.Segment = CurrentSegment.Clone();
                workflowEditor.AvailableMessageMetadata = AvailableMessageMetadata;
                workflowEditor.AvailableConditionsMetadata = AvailableConditionsMetadata;
                workflowEditor.AvailableActionsMetadata = AvailableActionsMetadata;

                if (dialogService.ShowDialog(workflowEditor,
                    new DialogOptions
                    {
                        ActivateParentAfterClose = true,
                        WindowStartupLocation = WindowStartupLocation.CenterScreen,
                        AutoHideHeader = false,
                        IsHeaderVisible = true,
                        IsTitleVisible = true,
                        Title = "Workflow Designer"
                    }) == true)
                {
                    CurrentSegment.Middlewares.Clear();
                    CurrentSegment.Middlewares = new ObservableCollection<MiddlewareModel>(workflowEditor.Segment.Middlewares);
                    CurrentSegment.Variables.Clear();
                    CurrentSegment.Variables = new ObservableCollection<VariableModel>(workflowEditor.Segment.Variables);
                    RefreshCommands();
                }
            }, () => CurrentSegment != null && SelectedMessageMetadata != null);

            SaveCommand = DelegateCommand.FromAsyncHandler(() => _executor.TryAsync(SaveRuleAsync).Finally(() =>
            {

            }).ExecuteAsync(), () => Validate() && CurrentSegment.Middlewares.Count > 0);

            CancelCommand = new DelegateCommand(() => _dialogService.Close(this, false), () => true);
        }

        private async Task SaveRuleAsync()
        {
            var segmentInfo = CurrentSegment.ToContract();

            if (IsAddingNew)
            {
                var rule = await _webComponentService.AddDataflowSegmentAsync(segmentInfo);
                if (rule != null)
                {
                    await _dispatcher.InvokeAsync(() => _dialogService.Close(this, true));
                }
            }
            else
            {
                var rule = await _webComponentService.UpdateDataflowSegmentAsync(segmentInfo);
                if (rule != null)
                {
                    await _dispatcher.InvokeAsync(() => _dialogService.Close(this, true));
                }
            }
        }

        protected override async Task OnInitialize()
        {
            if (!_isInitialised)
            {
                _isInitialised = true;
                
                
                CurrentSegment.OnCategoryChanged(category => _dispatcher.InvokeAsync(
                    () =>
                    {
                        MessageMetadatas.Clear();
                        AvailableMessageMetadata.Where(x => x.Category.Equals(category, StringComparison.OrdinalIgnoreCase)).ForEach(y => MessageMetadatas.Add(y.ToModel()));
                        if (CurrentSegment.MessageMetadata != null)
                        {
                            SelectedMessageMetadata =
                                MessageMetadatas.FirstOrDefault(
                                    x =>
                                        x.Id.Equals(CurrentSegment.MessageMetadata.Id,
                                            StringComparison.OrdinalIgnoreCase));
                        }

                        SaveCommand.RaiseCanExecuteChanged();
                    }));

                await _dispatcher.InvokeAsync(() =>
                   {
                       Categories.Clear();
                       AvailableModuleMetadata.Select(x => x.Name).ToList().ForEach(y => Categories.Add(y));

                       CurrentSegment.Category = Categories.FirstOrDefault(
                           x => x.Equals(CurrentSegment.Category, StringComparison.OrdinalIgnoreCase));
                   });
            }

            await base.OnInitialize();
        }

        public ObservableCollection<string> Categories
        {
            get { return GetProperty<ObservableCollection<string>>(); }
            set { SetProperty(value); }
        }

        
        public ObservableCollection<MessageMetadataModel> MessageMetadatas
        {
            get { return GetProperty<ObservableCollection<MessageMetadataModel>>(); }
            set { SetProperty(value); }
        }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Message type is required")]
        public MessageMetadataModel SelectedMessageMetadata
        {
            get { return GetProperty<MessageMetadataModel>(); }
            set
            {
                if (CanChangeMessageType())
                {
                    SetProperty(value);
                    CurrentSegment.MessageMetadata = value.Metadata;
                }

                RefreshCommands();
            }
        }

        protected override bool OnValidate(ICollection<ValidationResult> validationResults)
        {
            var selfValidate = base.OnValidate(validationResults);
            var childValidate = CurrentSegment.Validate();
            return selfValidate && childValidate;
        }

        private void RefreshCommands()
        {
            _dispatcher.InvokeAsync(() =>
            {
                LaunchWorkflowCommand.RaiseCanExecuteChanged();
                SaveCommand.RaiseCanExecuteChanged();
            });
        }

        private bool CanChangeMessageType()
        {
            if (CurrentSegment.Middlewares.Count > 0 && SelectedMessageMetadata!= null)
            {
                if (
                    _messageBoxService.Show(
                        "You are about to change the Message types for which you have added middlewares. Change in message type will reset the middlewares collection. Do you want to continue ?",
                        "Confirm action", MessageBoxButton.YesNo,MessageBoxImage.Question) == MessageBoxResult.Yes)
                {
                    CurrentSegment.Middlewares.Clear();
                    return true;
                }
                return false;
            }

            return true;
            
        }
        
        public DelegateCommand SaveCommand { get; private set; }
        public DelegateCommand CancelCommand { get; private set; }

        public bool IsAddingNew
        {
            get { return GetProperty<bool>(); }
            set { SetProperty(value); }
        }

        public DelegateCommand LaunchWorkflowCommand { get; set; }

        public IEnumerable<ModuleMetaData> AvailableModuleMetadata { get; set; }
        public IEnumerable<MessageMetadata> AvailableMessageMetadata { get; set; }
        public IEnumerable<ConditionsMetadata> AvailableConditionsMetadata { get; set; }
        public IEnumerable<ActionsMetadata> AvailableActionsMetadata { get; set; }
    }
}
