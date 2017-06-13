using System.Windows;
using System.Windows.Input;
using Pixytech.Desktop.Presentation.Infrastructure;
using Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces;

namespace Pixytech.Desktop.Presentation.Services
{
    /// <summary>
    /// Allow to control the host window from view model (see DialogService) and from XAML content page
    /// </summary>
    public class DialogOptions : ViewModelBase, IDialogOptions
    {
        public DialogOptions()
        {
            //IsTitleVisible = true;
            //Title = null;
            //ShowInTaskbar = true;
            //ShowActivated = true;
            SizeToContent = WindowSizeToContent.WidthAndHeight;
            //Topmost = false;
            WindowStartupLocation = WindowStartupLocation.CenterScreen;
            WindowState = System.Windows.WindowState.Normal;
            WindowStyle = System.Windows.WindowStyle.SingleBorderWindow;
            //ResizeMode = ResizeMode.CanResizeWithGrip;
            ActivateParentAfterClose = true;
            //AutoHideHeader = true;
            //IsHeaderVisible = true;
        }

        public ViewModelBase Owner { get; set; }

        public string Title
        {
            get
            {
                return GetProperty<string>();
            }

            set
            {
                SetProperty(value);
            }
        }

        public ICommand CloseCommand { get; set; }

        public ICommand ClosingCommand { get; set; }

        public bool ActivateParentAfterClose { get; set; }

        public bool? ShowInTaskbar
        {
            get
            {
                return GetProperty<bool?>();
            }

            set
            {
                SetProperty(value);
            }
        }

        public bool? ShowActivated
        {
            get
            {
                return GetProperty<bool?>();
            }

            set
            {
                SetProperty(value);
            }
        }

        public WindowSizeToContent? SizeToContent
        {
            get
            {
                return GetProperty<WindowSizeToContent?>();
            }

            set
            {
                SetProperty(value);
            }
        }

        public bool? Topmost
        {
            get
            {
                return GetProperty<bool?>();
            }

            set
            {
                SetProperty(value);
            }
        }

        public WindowStartupLocation WindowStartupLocation { get; set; }

        public WindowState? WindowState
        {
            get
            {
                return GetProperty<WindowState?>();
            }

            set
            {
                SetProperty(value);
            }
        }

        public WindowStyle? WindowStyle
        {
            get
            {
                return GetProperty<WindowStyle?>();
            }

            set
            {
                SetProperty(value);
            }
        }

        public ResizeMode? ResizeMode
        {
            get
            {
                return GetProperty<ResizeMode?>();
            }

            set
            {
                SetProperty(value);
            }
        }

        public bool? IsTitleVisible
        {
            get
            {
                return GetProperty<bool?>();
            }

            set
            {
                SetProperty(value);
            }
        }

        public bool? IsHeaderVisible
        {
            get
            {
                return GetProperty<bool?>();
            }

            set
            {
                SetProperty(value);
            }
        }

        public bool? AutoHideHeader
        {
            get
            {
                return GetProperty<bool?>();
            }

            set
            {
                SetProperty(value);
            }
        }
    }
}
