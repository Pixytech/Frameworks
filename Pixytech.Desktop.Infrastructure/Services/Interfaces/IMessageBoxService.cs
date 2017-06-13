using System.Windows;

namespace Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces
{
    public interface IMessageBoxService
    {
        MessageBoxResult Show(
            string messageBoxText,
            string caption,
            MessageBoxButton button,
            MessageBoxImage icon,
            MessageBoxResult defaultResult,
            MessageBoxOptions options);

        MessageBoxResult Show(
            string messageBoxText,
            string caption,
            MessageBoxButton button,
            MessageBoxImage icon,
            MessageBoxResult defaultResult);

        MessageBoxResult Show(
            string messageBoxText,
            string caption,
            MessageBoxButton button,
            MessageBoxImage icon);

        MessageBoxResult Show(
            string messageBoxText,
            string caption,
            MessageBoxButton button);

        MessageBoxResult Show(
           string messageBoxText,
           string caption);

        MessageBoxResult Show(string messageBoxText);

        MessageBoxResult Show(
            ViewModelBase owner,
            string messageBoxText,
            string caption,
            MessageBoxButton button,
            MessageBoxImage icon,
            MessageBoxResult defaultResult,
            MessageBoxOptions options);

        MessageBoxResult Show(
            ViewModelBase owner,
            string messageBoxText,
            string caption,
            MessageBoxButton button,
            MessageBoxImage icon,
            MessageBoxResult defaultResult);

        MessageBoxResult Show(
            ViewModelBase owner,
            string messageBoxText,
            string caption,
            MessageBoxButton button,
            MessageBoxImage icon);

        MessageBoxResult Show(
            ViewModelBase owner,
            string messageBoxText,
            string caption,
            MessageBoxButton button);

        MessageBoxResult Show(
            ViewModelBase owner,
           string messageBoxText,
           string caption);

        MessageBoxResult Show(ViewModelBase owner, string messageBoxText);
    }
}
