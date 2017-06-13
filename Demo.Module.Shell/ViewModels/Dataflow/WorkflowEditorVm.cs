using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Navigation;
using System.Windows.Threading;
using Graphnet.Core.IoC;
using Graphnet.Core.Logging;
using Graphnet.Core.Pipeline;
using Graphnet.Dashboard.CoreUI.Models;
using Graphnet.Dashboard.WebContracts;
using Graphnet.Dashboard.WebContracts.Dataflow;
using Graphnet.Dashboard.WebContracts.Dataflow.Metadata;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Dataflow;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.ExceptionManagement;
using Graphnet.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure.Commands;
using Graphnet.Wpf.Presentation.Infrastructure.Services.Interfaces;
using Graphnet.Wpf.Presentation.Services;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Dataflow
{
    internal class WorkflowEditorVm : ValidatableViewModelBase
    {
        private readonly IDispatcher _dispatcher;
        private readonly IDialogService _dialogService;
        private readonly ISafeExecutor _executor;
        private readonly IWebComponentService _webComponentService;
        private readonly IEnumerable<IMiddlewareEditorProvider> _editorProviders;
        private readonly IContainer _childContainer;
        private readonly ILog _logger = LogManager.GetLogger(typeof(WorkflowEditorVm));

        private bool _isInitialised;
        private IEnumerable<MiddlewareMetadata> _availableMiddlewaresMetadata;
        private IContainer _subChildContainer;
        public IEnumerable<MessageMetadata> AvailableMessageMetadata { get; set; }
        private readonly object _syncLock = new object();
        public WorkflowEditorVm(IDispatcher dispatcher, IDialogService dialogService,  ISafeExecutor executor, IWebComponentService webComponentService)
        {
           
            _dispatcher = dispatcher;
            _dialogService = dialogService;
            _executor = executor;
            _webComponentService = webComponentService;
            _childContainer = ObjectFactory.Container.BuildChildContainer();
            _editorProviders = _childContainer.BuildAll<IMiddlewareEditorProvider>();

            AddVariableCommand = new DelegateCommand(() =>
            {
                var variableBuilder = _childContainer.Build<VariableVm>();

                variableBuilder.AvailableMessages = AvailableMessageMetadata;
                variableBuilder.ExistingVariablesNames = Segment.Variables.Select(x=>x.Name).ToList();

                if (dialogService.ShowDialog(variableBuilder,
                    new DialogOptions
                    {
                        ActivateParentAfterClose = true,
                        AutoHideHeader = false,
                        IsHeaderVisible = true,
                        IsTitleVisible = true,
                        Title = "Add new variable"
                    }) == true)
                {

                    var variable = variableBuilder.CurrentVariable.ToContract().ToModel();
                    Segment.Variables.Add(variable);
                    SelectedVariable = variable;
                    RefreshCommands();
                }
            }, () => true);

            EditVariableCommand = new DelegateCommand(() =>
            {
                var variableBuilder = _childContainer.Build<VariableVm>();
                var selectedVariable = SelectedVariable;

                variableBuilder.AvailableMessages = AvailableMessageMetadata;
                var names = Segment.Variables.Select(x => x.Name).ToList();
                names.Remove(selectedVariable.Name);
                variableBuilder.ExistingVariablesNames = names;

                variableBuilder.CurrentVariable = selectedVariable;
                
                if (dialogService.ShowDialog(variableBuilder,
                    new DialogOptions
                    {
                        ActivateParentAfterClose = true,
                        AutoHideHeader = false,
                        IsHeaderVisible = true,
                        IsTitleVisible = true,
                        Title = "Edit variable"
                    }) == true)
                {

                    var variable = variableBuilder.CurrentVariable.ToContract().ToModel();
                    Segment.Variables.Remove(selectedVariable);
                    Segment.Variables.Add(variable);
                    SelectedVariable = variable;
                    RefreshCommands();
                }
            }, () => SelectedVariable != null && !SelectedVariable.IsSystemDefined);

            DeleteVariableCommand = new DelegateCommand(() => Segment.Variables.Remove(SelectedVariable), () => SelectedVariable!= null && !SelectedVariable.IsSystemDefined);

            MoveUpMiddlewareCommand = new DelegateCommand(() =>
            {
                var oldIndex = Segment.Middlewares.IndexOf(SelectedMiddleware);
                var newIndex = oldIndex - 1;
                Segment.Middlewares.Move(oldIndex, newIndex);
                RefreshCommands();
            }, () => SelectedMiddleware != null && Segment.Middlewares.IndexOf(SelectedMiddleware) > 0);

            MoveDownMiddlewareCommand = new DelegateCommand(() =>
            {
                var oldIndex = Segment.Middlewares.IndexOf(SelectedMiddleware);
                var newIndex = oldIndex + 1;
                Segment.Middlewares.Move(oldIndex, newIndex);
                RefreshCommands();
            },
                () =>
                    SelectedMiddleware != null &&
                    Segment.Middlewares.IndexOf(SelectedMiddleware) < Segment.Middlewares.Count - 1);


            AddMiddlewareCommand = new DelegateCommand(() =>
            {
                // Launch the model window to edit the selected segment
                // on save restart & refresh and on cancel do nothing
                var middlewareSelector = _childContainer.Build<MiddlewareSelectorVm>();
                
                middlewareSelector.Middlewares = BuildMiddlewares(_availableMiddlewaresMetadata);

                if (dialogService.ShowDialog(middlewareSelector,
                    new DialogOptions
                    {
                        ActivateParentAfterClose = true,
                        AutoHideHeader = false,
                        IsHeaderVisible = true,
                        IsTitleVisible = true,
                        Title = "Select middleware to add"
                    }) == true)
                {

                    var middleware = middlewareSelector.SelectedMiddleware.ToContract().ToModel();
                    Segment.Middlewares.Add(middleware);
                    SelectedMiddleware = middleware;
                    RefreshCommands();
                }
            }, () => true);

            
            DeleteMiddlewareCommand = new DelegateCommand(() =>
            {
                var index = Segment.Middlewares.IndexOf(SelectedMiddleware);
                var nextIndex = index - 1;

                Segment.Middlewares.Remove(SelectedMiddleware);

                SelectedMiddleware = nextIndex < 0 ? null : Segment.Middlewares[nextIndex];

                RefreshCommands();

            }, () => SelectedMiddleware != null);

            SaveCommand = new DelegateCommand(() =>
            {
                foreach (var middlewareModel in Segment.Middlewares)
                {
                    if (middlewareModel.Editor != null)
                    {
                        var option = middlewareModel.Editor.GetMiddlewareOption();
                        middlewareModel.MiddlewareInfo.MiddlewareOption = option.Serialize();
                        middlewareModel.MiddlewareInfo.MiddlewareOptionType = option.GetType();
                    }
                }
                
                _dialogService.Close(this, true);
            }, () => Segment.Middlewares.Count > 0 &&
                     Segment.Middlewares.Where(x => x.Editor != null)
                         .ToList()
                         .TrueForAll(x => x.Editor.IsValid));

            CancelCommand = new DelegateCommand(() => _dialogService.Close(this, false), () => true);
        }

        private ObservableCollection<MiddlewareModel> BuildMiddlewares(IEnumerable<MiddlewareMetadata> middlewares)
        {
            var result = new ObservableCollection<MiddlewareModel>();
            foreach (var middleware in middlewares)
            {
                if (middleware.Category.Equals(Segment.Category, StringComparison.OrdinalIgnoreCase) || string.IsNullOrEmpty(middleware.Category))
                    result.Add(middleware.Clone().ToModel());
            }
            return result;
        }

        protected override async Task OnInitialize()
        {
            try
            {
                IsLoading = true;

                _subChildContainer = _childContainer.BuildChildContainer();
                if (!_isInitialised)
                {
                    _isInitialised = true;
                
                    _availableMiddlewaresMetadata = await _webComponentService.GetDataflowMiddlewaresAsync();

                    foreach (var middlewareModel in Segment.Middlewares)
                    {
                        if (middlewareModel.MiddlewareOption == null)
                        {
                           middlewareModel.MiddlewareOption = GetMiddlewareInstance(middlewareModel.MiddlewareInfo);
                        }
                    }

                    SelectedMiddleware = Segment.Middlewares.FirstOrDefault();

                    await _dispatcher.InvokeAsync(AddSystemVariables);
                }

                await base.OnInitialize();
            }
            finally
            {
                IsLoading = false;
            }
        }

        protected override void OnCleanup()
        {
            _isInitialised = false;

            _subChildContainer.Dispose();

            foreach (var middlewareModel in Segment.Middlewares)
            {
                middlewareModel.Editor = null;
            }

            base.OnCleanup();
        }


        private void AddSystemVariables()
        {
            if (Segment.Variables.FirstOrDefault(x => x.Name.Equals(VariableConstants.PipelineInputMessage, StringComparison.OrdinalIgnoreCase))== null)
            {
                var inputMessagesVariable = new VariableModel
                {
                    Name = VariableConstants.PipelineInputMessage,
                    Type = typeof(IEnumerable<>).MakeGenericType(Segment.MessageMetadata.MessageType),
                    IsSystemDefined = true
                };

                Segment.Variables.Add(inputMessagesVariable);
            }

            if (Segment.Variables.FirstOrDefault(x => x.Name.Equals(VariableConstants.PipelineEngineContext, StringComparison.OrdinalIgnoreCase))== null)
            {
                var engineContextVariable = new VariableModel
                {
                    Name = VariableConstants.PipelineEngineContext,
                    Type = typeof(IPipelineContext),
                    IsSystemDefined = true
                };

                Segment.Variables.Add(engineContextVariable);
            }
        }

       
        private void StartLoadMiddlewareEditorAsync(MiddlewareModel selectedMiddleware)
        {
            if (selectedMiddleware != null)
            {
                if (selectedMiddleware.Editor == null)
                {
                    SearchMiddlewareEditor(selectedMiddleware);
                }

                Editor = selectedMiddleware.Editor;
            }
            else
            {
                Editor = null;
            }
        }

        public DelegateCommand CancelCommand { get; private set; }

        public DelegateCommand DeleteMiddlewareCommand { get; private set; }

        public DelegateCommand AddMiddlewareCommand { get; private set; }

        public DelegateCommand MoveDownMiddlewareCommand { get; private set; }

        public DelegateCommand SaveCommand { get; private set; }

        public DelegateCommand MoveUpMiddlewareCommand { get; private set; }

        private void RefreshCommands()
        {
            _dispatcher.InvokeAsync(() =>
            {
                AddMiddlewareCommand.RaiseCanExecuteChanged();
                DeleteMiddlewareCommand.RaiseCanExecuteChanged();
                MoveDownMiddlewareCommand.RaiseCanExecuteChanged();
                MoveUpMiddlewareCommand.RaiseCanExecuteChanged();
                SaveCommand.RaiseCanExecuteChanged();
                AddVariableCommand.RaiseCanExecuteChanged();
                EditVariableCommand.RaiseCanExecuteChanged();
                DeleteVariableCommand.RaiseCanExecuteChanged();
            });
        }

        public SegmentModel Segment { get; set; }

        public string StartMessageDescription
        {
            get { return string.Format("{0} messages recieved", Segment.MessageMetadata.MessageType.Name); }
        }

        public MiddlewareModel SelectedMiddleware
        {
            get { return GetProperty<MiddlewareModel>(); }
            set
            {
                lock (_syncLock)
                {
                    SetProperty(value);
                    StartLoadMiddlewareEditorAsync(value);
                }

                RefreshCommands();
            }
        }

        public VariableModel SelectedVariable
        {
            get { return GetProperty<VariableModel>(); }
            set
            {
                SetProperty(value);
                RefreshCommands();
            }
        }

        public bool IsLoading
        {
            get { return GetProperty<bool>(); }
            set { SetProperty(value); }
        }

        public bool IsEditorLoading
        {
            get { return GetProperty<bool>(); }
            set
            {
                SetProperty(value);
            }
        }

        
        private void SearchMiddlewareEditor(MiddlewareModel middlewareMetadata)
        {
            try
            {
                IsEditorLoading = true;
                if (_editorProviders != null)
                {
                    if (middlewareMetadata.Editor == null)
                    {
                        foreach (var middlewareEditorProvider in _editorProviders)
                        {
                            var editor =
                                middlewareEditorProvider.GetEditorType(
                                    middlewareMetadata.MiddlewareInfo.MiddlewareOptionType, _subChildContainer);
                            if (editor != null)
                            {
                                editor.RequestValidationAction = RefreshCommands;
                                editor.VariableProvider = new SegmentVariableProvider(Segment);
                                editor.AvailableMessageMetadata = AvailableMessageMetadata;
                                editor.AvailableConditionsMetadata = AvailableConditionsMetadata;
                                editor.AvailableActionsMetadata = AvailableActionsMetadata;
                                
                                var context = new EditorContext(() => SaveCommand.RaiseCanExecuteChanged())
                                {
                                    MiddlewareOptionType = middlewareMetadata.MiddlewareInfo.MiddlewareOptionType,
                                    MiddlewareOption = middlewareMetadata.MiddlewareOption,
                                    //MessageType = middlewareMetadata.MiddlewareInfo.MessageType,
                                    Variables = Segment.Variables
                                };

                                middlewareMetadata.Editor = editor;


                                editor.InitializeEditor(context);


                                break;
                            }
                        }
                    }
                }
            }
            finally
            {
                IsEditorLoading = false;
            }
        }

        private IMiddlewareOptionBase GetMiddlewareInstance(MiddlewareMetadata middlewareMetadata)
        {
            IMiddlewareOptionBase result = null;

            try
            {
                if (string.IsNullOrEmpty(middlewareMetadata.MiddlewareOption))
                {
                    result = Activator.CreateInstance(middlewareMetadata.MiddlewareOptionType) as IMiddlewareOptionBase;
                }
                else
                {
                    result = middlewareMetadata.GetMiddlewareOptions();
                }
            }
            catch(Exception ex)
            {
                _logger.Error("Unable to construct middlware option", ex);
                result = Activator.CreateInstance(middlewareMetadata.MiddlewareOptionType) as IMiddlewareOptionBase;
            }

            return result;
        }

     public IMiddlewareEditor Editor
        {
            get { return GetProperty<IMiddlewareEditor>(); }
            private set
            {
                if (value != null)
                {
                    value.Activate();
                }

                SetProperty(value);
                
                OnPropertyChanged(() => EditorNotAvailable);
            }
        }

        public bool EditorNotAvailable
        {
            get { return Editor == null; }
        }

        public DelegateCommand AddVariableCommand { get; set; }

        public DelegateCommand EditVariableCommand { get; set; }

        public DelegateCommand DeleteVariableCommand { get; set; }

        public IEnumerable<ConditionsMetadata> AvailableConditionsMetadata { get; set; }
        public IEnumerable<ActionsMetadata> AvailableActionsMetadata { get; set; }
    }
}
