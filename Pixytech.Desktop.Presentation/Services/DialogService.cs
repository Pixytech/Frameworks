using System;
using System.Linq.Expressions;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using Pixytech.Core;
using Pixytech.Desktop.Presentation.Controls;
using Pixytech.Desktop.Presentation.Helpers;
using Pixytech.Desktop.Presentation.Infrastructure;
using Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces;

namespace Pixytech.Desktop.Presentation.Services
{
    public class DialogService : IDialogService
    {
        public bool Activate(ViewModelBase viewModel)
        {
            Window window;
            return WindowHelper.TryFindWindowForViewModel(viewModel, out window) && window.Activate();
        }

        public bool? ShowDialog(ViewModelBase viewModel, IDialogOptions dialogOptions)
        {
            return ShowWindowInternal(viewModel, dialogOptions, true);
        }

        public bool? ShowDialog(ViewModelBase viewModel)
        {
            return ShowDialog(viewModel, new DialogOptions());
        }

        public void Show(ViewModelBase viewModel, IDialogOptions dialogOptions)
        {
            ShowWindowInternal(viewModel, dialogOptions, false);
        }

        public void Show(ViewModelBase viewModel)
        {
            Show(viewModel, new DialogOptions());
        }

        public void Close(ViewModelBase viewModel, bool? dialogResult = null)
        {
            Window window;
            if (WindowHelper.TryFindWindowForViewModel(viewModel, out window))
            {
                if (dialogResult != null)
                {
                    window.DialogResult = dialogResult;
                }
                window.Close();
            }
        }

        private bool? ShowWindowInternal(ViewModelBase viewModel, IDialogOptions dialogOptions, bool isModal)
        {
            var window = CreateWindow(dialogOptions);
            var parent = WindowHelper.GetParent(dialogOptions.Owner);
            if (!window.Equals(parent))
            {
                window.Owner = parent;
            }

            window.SetBinding(ContentControl.ContentProperty, string.Empty);

            window.DataContext = viewModel;
            
            if (isModal)
            {
                return window.ShowDialog();
            }

            window.Show();
            return null;
        }

        private ModernWindow CreateWindow(IDialogOptions dialogOptions)
        {
            var window = new ModernWindow();
            
            BindWithHostWindow(window, dialogOptions);

            window.Closing += (s, e) =>
            {
                if (dialogOptions.ClosingCommand != null)
                {
                    if (dialogOptions.ClosingCommand.CanExecute(e))
                    {
                        dialogOptions.ClosingCommand.Execute(e);
                    }
                }
            };

            window.Closed += (s, e) =>
            {
                if (dialogOptions.CloseCommand != null)
                {
                    if (dialogOptions.CloseCommand.CanExecute(window.DataContext))
                    {
                        dialogOptions.CloseCommand.Execute(window.DataContext);
                    }
                }

                var parent = window.Owner;
                if (dialogOptions.ActivateParentAfterClose && parent != null)
                {
                    parent.Activate();
                }
            };

            return window;
        }

       
        private void BindWithHostWindow(ModernWindow window, IDialogOptions dialogOptions)
        {
            window.WindowStartupLocation = dialogOptions.WindowStartupLocation;

            if (dialogOptions.Title != null)
                BindProperty(window, Window.TitleProperty, dialogOptions, () => dialogOptions.Title, BindingMode.TwoWay);

            if (dialogOptions.ShowActivated!= null)
                BindProperty(window, Window.ShowActivatedProperty, dialogOptions, () => dialogOptions.ShowActivated, BindingMode.TwoWay);

            if (dialogOptions.ShowInTaskbar != null)
            {
                BindProperty(window, Window.ShowInTaskbarProperty, dialogOptions, () => dialogOptions.ShowInTaskbar,
                    BindingMode.TwoWay);
            }

            if (dialogOptions.SizeToContent != null)
            {
                BindProperty(window, Window.SizeToContentProperty, dialogOptions, () => dialogOptions.SizeToContent,
                    BindingMode.TwoWay, new SizeToContentConvertor());
            }

            if (dialogOptions.Topmost != null)
            {
                BindProperty(window, Window.TopmostProperty, dialogOptions, () => dialogOptions.Topmost,
                    BindingMode.TwoWay);
            }

            if (dialogOptions.WindowState != null)
            {
                BindProperty(window, Window.WindowStateProperty, dialogOptions, () => dialogOptions.WindowState,
                    BindingMode.TwoWay);
            }

            if (dialogOptions.WindowStyle != null)
            {

                BindProperty(window, Window.WindowStyleProperty, dialogOptions, () => dialogOptions.WindowStyle,
                    BindingMode.TwoWay);
            }

            if (dialogOptions.ResizeMode != null)
            {

                BindProperty(window, Window.ResizeModeProperty, dialogOptions, () => dialogOptions.ResizeMode,
                    BindingMode.TwoWay);
            }

            if (dialogOptions.IsTitleVisible != null)
            {
                BindProperty(window, ModernWindow.IsTitleVisibleProperty, dialogOptions,
                    () => dialogOptions.IsTitleVisible, BindingMode.TwoWay);
            }

            if (dialogOptions.IsHeaderVisible != null)
            {
                BindProperty(window, ModernWindow.IsHeaderVisibleProperty, dialogOptions,
                    () => dialogOptions.IsHeaderVisible, BindingMode.TwoWay);
            }

            if (dialogOptions.AutoHideHeader != null)
            {

                BindProperty(window, ModernWindow.AutoHideHeaderProperty, dialogOptions,
                    () => dialogOptions.AutoHideHeader, BindingMode.TwoWay);
            }
        }

        private void BindProperty<T>(Window target, DependencyProperty targetProperty, IDialogOptions source, Expression<Func<T>> propertyExpression, BindingMode bindingMode, IValueConverter convertor = null)
        {
            string sourcePropertyName = PropertySupport.ExtractPropertyName(propertyExpression);
            target.SetBinding(targetProperty, new Binding(sourcePropertyName) { Source = source, Mode = bindingMode, Converter = convertor });
        }

        private class SizeToContentConvertor : IValueConverter
        {

            public object Convert(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
            {
                return ConvertSizeToContent((WindowSizeToContent)value);
            }

            private static SizeToContent ConvertSizeToContent(WindowSizeToContent value)
            {
                var windowSizeToContext = value;
                switch (windowSizeToContext)
                {
                    case WindowSizeToContent.Height:
                        return SizeToContent.Height;
                    case WindowSizeToContent.Width:
                        return SizeToContent.Width;
                    case WindowSizeToContent.Manual:
                        return SizeToContent.Manual;
                    case WindowSizeToContent.WidthAndHeight:
                        return SizeToContent.WidthAndHeight;
                }
                return SizeToContent.WidthAndHeight;
            }

            public object ConvertBack(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
            {
                var sizeToContent = (SizeToContent)value;
                switch (sizeToContent)
                {
                    case SizeToContent.Height:
                        return WindowSizeToContent.Height;
                    case SizeToContent.Width:
                        return WindowSizeToContent.Width;
                    case SizeToContent.Manual:
                        return WindowSizeToContent.Manual;
                    case SizeToContent.WidthAndHeight:
                        return WindowSizeToContent.WidthAndHeight;
                }
                return WindowSizeToContent.WidthAndHeight;
            }
        }
    }
}
