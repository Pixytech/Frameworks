namespace Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces
{
    public interface IDialogService
    {
        bool Activate(ViewModelBase viewModel);
        
        bool? ShowDialog(ViewModelBase viewModel, IDialogOptions dialogOptions);

        bool? ShowDialog(ViewModelBase viewModel);

        void Show(ViewModelBase viewModel, IDialogOptions dialogOptions);

        void Show(ViewModelBase viewModel);

        void Close(ViewModelBase viewModel, bool? dialogResult = null);
    }
}
