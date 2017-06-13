using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Threading;
using Graphnet.Core.IoC;
using Graphnet.Dashboard.CoreUI.Models;
using Graphnet.Dashboard.WebContracts;
using Graphnet.Dashboard.WebContracts.Dataflow.Metadata;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.ExceptionManagement;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Services;
using Graphnet.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure.Commands;
using Graphnet.Wpf.Presentation.Infrastructure.Services.Interfaces;
using Graphnet.Wpf.Presentation.Services;
using Microsoft.Practices.Prism.Regions;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Dataflow
{
    internal class DataflowVm : BasePage, INavigationAware
    {
        private readonly IDispatcher _dispatcher;
        private readonly ISafeExecutor _executor;
        private readonly IWebPermissionMatrix _permissionMatrix;
        private bool _isInitialized;
        private readonly SegmentAction _refreshSegmentAction;
        private readonly SegmentAction _editSegmentAction;
        private readonly SegmentAction _restartSegmentAction;
        private readonly IWebComponentService _componentService;
        private readonly IDialogService _dialogService;
        private readonly SegmentAction _launchExceptionViewWindow;
        private IEnumerable<MessageMetadata> _availableMessageMetadata;
        private IEnumerable<ModuleMetaData> _availableModuleMetadata;
        private IEnumerable<ConditionsMetadata> _availableConditionsMetadata;
        private IEnumerable<ActionsMetadata> _availableActionsMetadata;


        public DataflowVm(IDispatcher dispatcher, ISafeExecutor executor, IWebComponentService componentService, IPermissionsService permissionsService, IDialogService dialogService, DataflowExceptionsVm dataflowExceptionsVm)
        {
            Title = "Dataflow Rules";

            _dispatcher = dispatcher;
            _executor = executor;
            _componentService = componentService;
            _dialogService = dialogService;
            DataflowExceptions = dataflowExceptionsVm;    
            _permissionMatrix = permissionsService.GetPermissionMatrix(_componentService);

            _launchExceptionViewWindow = new SegmentAction
            {
                Title = "Show Dataflow debugger",
                Command = new DelegateCommand(() =>
                {
                    DataflowExceptions.IsDataflowExceptionsVisible = !DataflowExceptions.IsDataflowExceptionsVisible;

                    _launchExceptionViewWindow.Title = DataflowExceptions.IsDataflowExceptionsVisible ? "Hide debugger" : "Show dataflow debugger";

                   
                }, () => true)
            };

            DataflowExceptions.OnVisibilityChange(
                       () =>
                       {
                           _launchExceptionViewWindow.Title = DataflowExceptions.IsDataflowExceptionsVisible
                               ? "Hide debugger"
                               : "Show dataflow debugger";
                       });

            _editSegmentAction = new SegmentAction
            {
                Title = "Edit the rule",
                Command = DelegateCommand.FromAsyncHandler(
                    async () =>
                    {
                        IsBusy = true;
                        // Launch the model window to edit the selected segment
                        // on save restart & refresh and on cancel do nothing
                        var ruleEditor = ObjectFactory.Builder.Build<RuleEditorVm>();
                        await ConfigureRuleEditor(componentService, ruleEditor);
                        ruleEditor.CurrentSegment = SelectedSegment.Clone();
                        ruleEditor.CurrentSegment.EnableValidation = true;
                        ruleEditor.IsAddingNew = false;
                        if (_dialogService.ShowDialog(ruleEditor,
                            new DialogOptions
                            {
                                ActivateParentAfterClose = true,
                                AutoHideHeader = false,
                                IsHeaderVisible = true,
                                IsTitleVisible = true,
                                Title = "Edit dataflow rule"
                            }) == true)
                        {
                            await _restartSegmentAction.Command.Execute();                            
                        }
                        
                        IsBusy = false;
                    }, () => SelectedSegment != null && !IsBusy)
            };

            _restartSegmentAction = new SegmentAction
            {
                Title = "Restart the rule engine",
                Command = DelegateCommand.FromAsyncHandler(
                    () => _executor.TryAsync(async () =>
                    {
                        IsBusy = true;
                        var isAccepted = await _componentService.RestartDataflowSegmentAsync(SelectedSegment.Id);
                        if (isAccepted)
                        {
                            await Task.Delay(TimeSpan.FromSeconds(3));
                            await RefreshSegmentInfos();
                        }

                    }).Finally(() => { IsBusy = false; }).ExecuteAsync(),
                    () => SelectedSegment != null && !IsBusy)
            };

            
            _refreshSegmentAction = new SegmentAction
            {
                Title = "Refresh the rule",
                Command = DelegateCommand.FromAsyncHandler(
                    () => _executor.TryAsync(async () =>
                    {
                        IsBusy = true;
                        var segmentInfo = await _componentService.GetDataflowSegmentAsync(SelectedSegment.Id);

                        await UpdateSegment(segmentInfo.ToSegmentControllerModel());

                    }).Finally(() => { IsBusy = false; }).ExecuteAsync(),
                    () => SelectedSegment != null && !IsBusy)
            };
           
            RefreshCommand =
                DelegateCommand.FromAsyncHandler(
                    () => _executor.TryAsync(async () =>
                    {
                        IsBusy = true;
                        await RefreshSegmentInfos();
                    }).Finally(() => { IsBusy = false; }).ExecuteAsync(),
                    () => !IsBusy);

            AddRuleCommand = DelegateCommand.FromAsyncHandler(
                async () =>
                {
                    IsBusy = true;
                    // Launch the model window to edit the selected segment
                    // on save restart & refresh and on cancel do nothing
                    var ruleEditor = ObjectFactory.Builder.Build<RuleEditorVm>();
                    await ConfigureRuleEditor(componentService, ruleEditor);
                    ruleEditor.CurrentSegment = new SegmentModel {EnableValidation = true};
                    ruleEditor.IsAddingNew = true;
                    if (_dialogService.ShowDialog(ruleEditor,
                        new DialogOptions
                        {
                            ActivateParentAfterClose = true,
                            AutoHideHeader = false,
                            IsHeaderVisible = true,
                            IsTitleVisible = true,
                            Title = "Add new dataflow rule"
                        }) == true)
                    {
                        SelectedSegment = ruleEditor.CurrentSegment.ToSegmentControllerModel();
                        if (SelectedSegment.IsActive)
                        {
                            await _restartSegmentAction.Command.Execute();
                        }
                        else
                        {
                            await RefreshCommand.Execute();
                        }
                    }
                    IsBusy = false;
                },
                () => !IsBusy);

            DeleteRuleCommand =
                DelegateCommand.FromAsyncHandler(
                    () => _executor.TryAsync(async () =>
                    {
                        IsBusy = true;

                       var isDeleted = await _componentService.DeleteDataflowSegmentAsync(SelectedSegment.Id);
                        if (isDeleted)
                        {
                           await RefreshCommand.Execute();
                        }

                    }).Finally(() => { IsBusy = false; }).ExecuteAsync(),
                    () => SelectedSegment != null && !IsBusy && !SelectedSegment.IsActive && !SelectedSegment.IsSystemDefined);
        }

        private async Task RefreshSegmentInfos()
        {
            var segmentInfos = await _componentService.GetDataflowSegmentsAsync();
            var lastSelection = SelectedSegment;
            Segments = new ObservableCollection<SegmentModelController>(segmentInfos.ToSegmentControllerModel());

            SelectedSegment = (lastSelection == null
                ? Segments.FirstOrDefault()
                : Segments.FirstOrDefault(x => x.Id == lastSelection.Id)) ?? Segments.FirstOrDefault();
        }

        private async Task ConfigureRuleEditor(IWebComponentService componentService, RuleEditorVm ruleEditor)
        {
            if (_availableMessageMetadata == null)
            {
                _availableMessageMetadata = await componentService.GetDataflowMessagesAsync();
                _availableModuleMetadata = (await componentService.GetModulesMetaDataAsync()).Where(x => x.IsCoreComponent == false);
                _availableConditionsMetadata = await componentService.GetDataflowConditionsAsync();
                _availableActionsMetadata = await componentService.GetDataflowActionsAsync();
            }

            ruleEditor.AvailableMessageMetadata = _availableMessageMetadata;
            ruleEditor.AvailableModuleMetadata = _availableModuleMetadata;
            ruleEditor.AvailableConditionsMetadata = _availableConditionsMetadata;
            ruleEditor.AvailableActionsMetadata = _availableActionsMetadata;
        }

        private async Task UpdateSegment(SegmentModelController model)
        {
            await _dispatcher.InvokeAsync(() =>
            {
                var oldSegment = Segments.FirstOrDefault(x => x.Id == model.Id);
                var index = Segments.Count;
                var lastSelectionId = SelectedSegment.Id;
                if (oldSegment != null)
                {
                    index = Segments.IndexOf(oldSegment);
                    Segments.Remove(oldSegment);
                }

                Segments.Insert(index, model);

                SelectedSegment = Segments.FirstOrDefault(x => x.Id == lastSelectionId) ?? Segments.FirstOrDefault();
            });
        }

        public bool IsNavigationTarget(NavigationContext navigationContext)
        {
            return true;
        }

        public void OnNavigatedFrom(NavigationContext navigationContext)
        {
        }

        public void OnNavigatedTo(NavigationContext navigationContext)
        {
        }

        public DataflowExceptionsVm DataflowExceptions
        {
            get { return GetProperty<DataflowExceptionsVm>(); }
            private set { SetProperty(value); }
        }

        protected override async Task OnInitialize()
        {
            if (!_isInitialized)
            {
                DataflowExceptions.IsDataflowExceptionsVisible = false;
                _isInitialized = true;
                await RefreshCommand.Execute();
            }
        }

        public DelegateCommand RefreshCommand { get; private set; }

        public ObservableCollection<SegmentModelController> Segments
        {
            get { return GetProperty<ObservableCollection<SegmentModelController>>(); }
            set { SetProperty(value); }
        }

        public SegmentModelController SelectedSegment
        {
            get { return GetProperty<SegmentModelController>(); }
            set
            {
                if (value != null)
                {
                    _dispatcher.BeginInvoke(new Action<SegmentModelController>(s => s.SegmentActions.Clear()),
                        DispatcherPriority.Render, value);

                    _dispatcher.BeginInvoke(new Action<SegmentModelController>(BuildActions), DispatcherPriority.Background,
                        value);
                }

                SetProperty(value);
                DataflowExceptions.SelectedSegment = value;
                _dispatcher.BeginInvoke(new Action(() =>
                {
                    DeleteRuleCommand.RaiseCanExecuteChanged();
                    AddRuleCommand.RaiseCanExecuteChanged();
                }), DispatcherPriority.Background,
                    null);

            }
        }

        private void BuildActions(SegmentModelController segment)
        {
            if (_permissionMatrix.CanChangeDataflow) segment.SegmentActions.Add(_editSegmentAction);

            if (_permissionMatrix.CanRestartDataflowSegment && segment.IsActive) segment.SegmentActions.Add(_restartSegmentAction);

            //if (_permissionMatrix.CanTestDataflow && segment.IsActive) segment.SegmentActions.Add(_testSegmentAction);
            
            if(_permissionMatrix.CanGetDataflow) segment.SegmentActions.Add(_refreshSegmentAction);

            segment.SegmentActions.Add(_launchExceptionViewWindow);
        }
        
        public bool IsBusy
        {
            get { return GetProperty<bool>(); }
            set { SetProperty(value); }
        }

        public DelegateCommand AddRuleCommand { get; private set; }

        public DelegateCommand DeleteRuleCommand { get; private set; }

    }
}
