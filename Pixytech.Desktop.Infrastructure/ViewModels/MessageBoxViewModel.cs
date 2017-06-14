using System.Windows;
using System.Windows.Input;
using Pixytech.Desktop.Presentation.Infrastructure;
using Pixytech.Desktop.Presentation.Infrastructure.Commands;
using Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces;

namespace Pixytech.Desktop.Presentation.Infrastructure.ViewModels
{
    public class MessageBoxViewModel : ViewModelBase
    {
        private readonly IDialogService _dialogService;
        private MessageBoxImage _icon;
        private MessageBoxResult _defaultResult;
        private MessageBoxOptions _options;

        public MessageBoxViewModel(IDialogService dialogService, string messageBoxText, MessageBoxButton button, MessageBoxImage icon, MessageBoxResult defaultResult, MessageBoxOptions options)
        {
            // TODO: Complete member initialization
            MessgaeBoxText = messageBoxText;
            _dialogService = dialogService;
            Buttons = button;
            _icon = icon;
            _defaultResult = defaultResult;
            _options = options;
            Command = new DelegateCommand<string>(OnUserAction);
        }

        private void OnUserAction(string argument)
        {
            switch (argument)
            {
                case "YES":
                    Result = MessageBoxResult.Yes;
                    break;
                case "NO":
                    Result = MessageBoxResult.No;
                    break;
                case "OK":
                    Result = MessageBoxResult.OK;
                    break;
                case "CANCEL":
                    Result = MessageBoxResult.Cancel;
                    break;
            }

            _dialogService.Close(this);
        }

        public MessageBoxButton Buttons { get; private set; }
        public string MessgaeBoxText { get; private set; }
        public MessageBoxResult Result { get; private set; }
        public ICommand Command { get; private set; }
    }
}
