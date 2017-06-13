using System.Windows;
using Pixytech.Desktop.Presentation.Infrastructure;
using Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces;
using Pixytech.Desktop.Presentation.ViewModels;

namespace Pixytech.Desktop.Presentation.Services
{
    public class MessagBoxService : IMessageBoxService
    {
        private readonly IDialogService _dialogService;

        public MessagBoxService(IDialogService dialogService)
        {
            _dialogService = dialogService;
        }

        public MessageBoxResult Show(string messageBoxText, string caption, MessageBoxButton button, MessageBoxImage icon, MessageBoxResult defaultResult, MessageBoxOptions options)
        {
            return Show(null, messageBoxText, caption, button, icon, defaultResult, options);
        }

        public MessageBoxResult Show(string messageBoxText, string caption, MessageBoxButton button, MessageBoxImage icon, MessageBoxResult defaultResult)
        {
            return Show(null, messageBoxText, caption, button, icon, defaultResult, MessageBoxOptions.None);
        }

        public MessageBoxResult Show(string messageBoxText, string caption, MessageBoxButton button, MessageBoxImage icon)
        {
            return Show(null, messageBoxText, caption, button, icon, MessageBoxResult.None);
        }

        public MessageBoxResult Show(string messageBoxText, string caption, MessageBoxButton button)
        {
            return Show(null, messageBoxText, caption, button, MessageBoxImage.None);
        }

        public MessageBoxResult Show(string messageBoxText, string caption)
        {
            return Show(null, messageBoxText, caption, MessageBoxButton.OK);
        }

        public MessageBoxResult Show(string messageBoxText)
        {
            return Show(null, messageBoxText, string.Empty);
        }

        public MessageBoxResult Show(ViewModelBase owner, string messageBoxText, string caption, MessageBoxButton button, MessageBoxImage icon, MessageBoxResult defaultResult, MessageBoxOptions options)
        {
            return ShowInternal(owner, messageBoxText, caption, button, icon, defaultResult, options);
        }

        public MessageBoxResult Show(ViewModelBase owner, string messageBoxText, string caption, MessageBoxButton button, MessageBoxImage icon, MessageBoxResult defaultResult)
        {
            return Show(owner, messageBoxText, caption, button, icon, defaultResult, MessageBoxOptions.None);
        }

        public MessageBoxResult Show(ViewModelBase owner, string messageBoxText, string caption, MessageBoxButton button, MessageBoxImage icon)
        {
            return Show(owner, messageBoxText, caption, button, icon, MessageBoxResult.None);
        }

        public MessageBoxResult Show(ViewModelBase owner, string messageBoxText, string caption, MessageBoxButton button)
        {
            return Show(owner, messageBoxText, caption, button, MessageBoxImage.None);
        }

        public MessageBoxResult Show(ViewModelBase owner, string messageBoxText, string caption)
        {
            return Show(owner, messageBoxText, caption, MessageBoxButton.OK);
        }

        public MessageBoxResult Show(ViewModelBase owner, string messageBoxText)
        {
            return Show(owner, messageBoxText, string.Empty);
        }

        public MessageBoxResult ShowInternal(ViewModelBase owner, string messageBoxText, string caption, MessageBoxButton button, MessageBoxImage icon, MessageBoxResult defaultResult, MessageBoxOptions options)
        {
            var messageBoxViewModel = new MessageBoxViewModel(_dialogService, messageBoxText, button, icon, defaultResult, options);
            _dialogService.ShowDialog(messageBoxViewModel, new DialogOptions { Owner = owner, Title = caption, IsTitleVisible = true, SizeToContent = WindowSizeToContent.WidthAndHeight,ResizeMode = ResizeMode.NoResize,AutoHideHeader = false});
            return messageBoxViewModel.Result;
        }
    }
}
