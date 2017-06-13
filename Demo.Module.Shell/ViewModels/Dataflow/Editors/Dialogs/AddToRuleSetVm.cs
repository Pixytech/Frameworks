using System.Collections.Generic;
using System.Collections.ObjectModel;
using Graphnet.Core.IoC;
using Graphnet.Dashboard.WebContracts;
using Graphnet.Dashboard.WebContracts.Dataflow.Metadata;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.ExceptionManagement;
using Graphnet.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure.Commands;
using Graphnet.Wpf.Presentation.Infrastructure.Services.Interfaces;
using Graphnet.Wpf.Presentation.Services;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Dataflow.Editors.Dialogs
{

    internal class AddToRuleSetVm : ViewModelBase
    {
        private readonly IDispatcher _dispatcher;
        private IBuilder _builder;
        private readonly IDialogService _dialogService;
        private ISafeExecutor _safeExecutor;
        private IMessageBoxService _messageBoxService;

        private IWebComponentService _webComponentService;
         

        public AddToRuleSetVm(IDispatcher dispatcher, IBuilder builder, IDialogService dialogService, ISafeExecutor safeExecutor, IMessageBoxService messageBoxService, IWebComponentService webComponentService)
        {

            _dispatcher = dispatcher;
            _builder = builder;
            _dialogService = dialogService;
            _safeExecutor = safeExecutor;
            _messageBoxService = messageBoxService;
            _webComponentService = webComponentService;

            
            // Button Handlers
            SaveCommand = new DelegateCommand(() =>
            {
                if (SelectedComponent != null)
                {
                    SelectedComponentResult = SelectedComponent;

                    _dialogService.Close(this, true);
                }
            }, () => true);

            CancelCommand = new DelegateCommand(() => _dialogService.Close(this, false), () => true);
        }

        public void SetAction(IEnumerable<ActionsMetadata> actions)
        {
            Components = new ObservableCollection<DataflowPartBase>();
            foreach (var a in actions)
            {
                Components.Add( a );
            }
            ComponentType = "Action";

        }

        public DataflowPartBase SelectedComponent 
        {
            get { return GetProperty<DataflowPartBase>(); }
            set
            {
                SetProperty(value);
                RefreshCommands();
            }
        }

        public DataflowPartBase SelectedComponentResult
        {
            get { return GetProperty<DataflowPartBase>(); }
            set
            {
                SetProperty(value);
                RefreshCommands();
            }
        }

        public void SetCondition(IEnumerable<ConditionsMetadata> conditions)
        {
            Components = new ObservableCollection<DataflowPartBase>();
            foreach (var c in conditions)
            {
                Components.Add( c );
            }
            ComponentType = "Condition";

        }

        public string ComponentType
        {
            get { return GetProperty<string>(); }
            set
            {
                SetProperty(value);
                RefreshCommands();
            }
        }

        public ObservableCollection<DataflowPartBase> Components
        {
            get { return GetProperty<ObservableCollection<DataflowPartBase>>(); }
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
                SaveCommand.RaiseCanExecuteChanged();
                CancelCommand.RaiseCanExecuteChanged();
                
            });
        }



        public DelegateCommand SaveCommand { get; private set; }
        public DelegateCommand CancelCommand { get; private set; }


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
