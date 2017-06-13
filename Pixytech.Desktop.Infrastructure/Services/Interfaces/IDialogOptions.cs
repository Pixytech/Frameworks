using System.Windows;
using System.Windows.Input;

namespace Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces
{
    /// <summary>
    /// Allow to control the host window from view model (see DialogService) and from XAML content page
    /// </summary>
    public interface IDialogOptions
    {
        ViewModelBase Owner { get; set; }

        string Title { get; set; }
        
        ICommand CloseCommand  { get; set; }

        ICommand ClosingCommand  { get; set; }

        bool ActivateParentAfterClose  { get; set; }

        bool? ShowInTaskbar  { get; set; }

        bool? ShowActivated { get; set; }
        
        WindowSizeToContent? SizeToContent { get; set; }
        
        bool? Topmost { get; set; }
        
        WindowStartupLocation WindowStartupLocation  { get; set; }

        WindowState? WindowState { get; set; }
        
        WindowStyle? WindowStyle { get; set; }

        ResizeMode? ResizeMode { get; set; }

        bool? IsTitleVisible { get; set; }

        bool? IsHeaderVisible { get; set; }

        bool? AutoHideHeader { get; set; }
    }
}
