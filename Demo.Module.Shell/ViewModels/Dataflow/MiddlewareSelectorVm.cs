using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Graphnet.Dashboard.CoreUI.Models;
using Graphnet.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure.Commands;
using Graphnet.Wpf.Presentation.Infrastructure.Services.Interfaces;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Dataflow
{
    internal class MiddlewareSelectorVm : ValidatableViewModelBase
    {
        private readonly IDialogService _dialogService;
        private bool _initialized;
       
        public MiddlewareSelectorVm(IDialogService dialogService)
        {
            _dialogService = dialogService;
            
            SaveCommand = new DelegateCommand(() => _dialogService.Close(this, true), Validate );

           CancelCommand = new DelegateCommand(() => _dialogService.Close(this, false), () => true);
        }

        
        protected override async Task OnInitialize()
        {
            if (!_initialized)
            {
                _initialized = true;
               
            }

            await base.OnInitialize();
        }

        public DelegateCommand SaveCommand { get; private set; }

        public DelegateCommand CancelCommand { get; private set; }

        public ObservableCollection<MiddlewareModel> Middlewares { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Middleware is required")]
        public MiddlewareModel SelectedMiddleware
        {
            get { return GetProperty<MiddlewareModel>(); }
            set
            {
                SetProperty(value);
                SaveCommand.RaiseCanExecuteChanged();
            }
        }

        public MessageMetadataModel MessageMetadata { get; set; }
    }
}
