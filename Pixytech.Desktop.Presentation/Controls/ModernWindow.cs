using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Threading;
using Pixytech.Desktop.Presentation.Helpers.Win32;

namespace Pixytech.Desktop.Presentation.Controls
{
    [TemplatePart(Name = "PART_Header", Type = typeof(ContentPresenter))]
    [TemplatePart(Name = "PART_Content", Type = typeof(ContentPresenter))]
    public class ModernWindow : DpiAwareWindow
    {

        /// <summary>
        /// Identifies the IsTitleVisible dependency property.
        /// </summary>
        public static readonly DependencyProperty IsTitleVisibleProperty = DependencyProperty.Register("IsTitleVisible", typeof(bool), typeof(ModernWindow), new PropertyMetadata(false));

        public static readonly DependencyProperty LogoDataProperty = DependencyProperty.Register("LogoData", typeof(Geometry), typeof(ModernWindow));

        public static readonly DependencyProperty HeaderProperty = DependencyProperty.Register(
            "Header",
            typeof(object),
            typeof(ModernWindow),
            new UIPropertyMetadata(null));

        public static readonly DependencyProperty HeaderTemplateProperty = DependencyProperty.Register("HeaderTemplate", typeof(DataTemplate), typeof(ModernWindow), new UIPropertyMetadata(null));

        public static readonly DependencyProperty IsHeaderVisibleProperty = DependencyProperty.Register("IsHeaderVisible", typeof(bool), typeof(ModernWindow), new PropertyMetadata(false, OnHeaderVisibilityChanged));


        public static readonly DependencyProperty AutoHideHeaderProperty = DependencyProperty.Register("AutoHideHeader", typeof(bool), typeof(ModernWindow), new PropertyMetadata(true));
        private HwndSource _source;
        private bool _mainMenuOrToolBarClicked;


        private static void OnHeaderVisibilityChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            var window = (ModernWindow) d;
            var isVisibile = window.IsHeaderVisible;
            VisualStateManager.GoToState(window, isVisibile ? "HeaderVisible" : "HeaderHidden", true);
        }

        public bool AutoHideHeader
        {
            get
            {
                return (bool)GetValue(AutoHideHeaderProperty);
            }
            set
            {
                SetValue(AutoHideHeaderProperty, value);
            }
        }

        public bool IsHeaderVisible
        {
            get
            {
                return (bool)GetValue(IsHeaderVisibleProperty);
            }
            set
            {
                SetValue(IsHeaderVisibleProperty, value);
            }
        }

        public DataTemplate HeaderTemplate
        {
            get
            {
                return (DataTemplate)GetValue(HeaderTemplateProperty);
            }
            set
            {
                SetValue(HeaderTemplateProperty, value);
            }
        }


        public object Header
        {
            get
            {
                return GetValue(HeaderProperty);
            }
            set
            {
                SetValue(HeaderProperty, value);
            }
        }

        static ModernWindow()
        {
            DefaultStyleKeyProperty.OverrideMetadata(typeof(ModernWindow), new FrameworkPropertyMetadata(typeof(ModernWindow)));
        }

        public ModernWindow()
        {
            CommandBindings.Add(new CommandBinding(SystemCommands.CloseWindowCommand, (sender, e) => SystemCommands.CloseWindow(this)));
            CommandBindings.Add(new CommandBinding(SystemCommands.MaximizeWindowCommand, (sender, e) => SystemCommands.MaximizeWindow(this)));
            CommandBindings.Add(new CommandBinding(SystemCommands.MinimizeWindowCommand, (sender, e) =>
            {
                SystemCommands.MinimizeWindow(this);
                var owner = Owner ?? Application.Current.MainWindow;

                if (owner != null)
                {
                    Dispatcher.BeginInvoke(new Action<Window>(window => window.Activate()),
                        DispatcherPriority.Render, owner);
                }
            }));
        }


        protected override void OnSourceInitialized(EventArgs e)
        {
            base.OnSourceInitialized(e);

            var hook = new HwndSourceHook(WndProc);
            _source = PresentationSource.FromVisual(this) as HwndSource;
            if (_source != null) _source.AddHook(hook);
        }


        private bool IsMenuOrToolbarClicked()
        {
            _mainMenuOrToolBarClicked = false;
            Point clickedPoint = Mouse.GetPosition(this);
            VisualTreeHelper.HitTest(this,
                                     null,
                                     HitTestCallback,
                                     new PointHitTestParameters(clickedPoint));
            return _mainMenuOrToolBarClicked;
        }

        private HitTestResultBehavior HitTestCallback(HitTestResult result)
        {
            DependencyObject visualHit = result.VisualHit;
            var parentMenu = GetVisualParent<Menu>(visualHit);
            if (parentMenu != null && parentMenu.IsMainMenu)
            {
                _mainMenuOrToolBarClicked = true;
                return HitTestResultBehavior.Stop;
            }
            var parentToolBar = GetVisualParent<ToolBar>(visualHit);
            if (parentToolBar != null)
            {
                _mainMenuOrToolBarClicked = true;
                return HitTestResultBehavior.Stop;
            }
            return HitTestResultBehavior.Continue;
        }

        private static T GetVisualParent<T>(object childObject) where T : Visual
        {
            var child = childObject as DependencyObject;
            while ((child != null) && !(child is T))
            {
                child = VisualTreeHelper.GetParent(child);
            }
            return child as T;
        }

        protected override void OnPreviewGotKeyboardFocus(KeyboardFocusChangedEventArgs e)
        {
            var menu = e.OriginalSource as MenuItem;
            if (menu != null)
            {
                e.Handled = true;
                return;
            }

            var toolBar = e.OriginalSource as ToolBar;
            if (toolBar != null)
            {
                e.Handled = true;
                return;
            }
            base.OnPreviewGotKeyboardFocus(e);
        }

        private IntPtr WndProc(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, ref bool handled)
        {

            switch (msg)
            {
                case NativeMethods.WM_MOUSEACTIVATE:

                    if (IsMenuOrToolbarClicked())
                    {
                        handled = true;
                        return new IntPtr(NativeMethods.MA_NOACTIVATE);
                    }
                    break;
            }
            return IntPtr.Zero;
        }

        /// <summary>
        /// Gets or sets a value indicating whether the window title is visible in the UI.
        /// </summary>
        public bool IsTitleVisible
        {
            get { return (bool)GetValue(IsTitleVisibleProperty); }
            set { SetValue(IsTitleVisibleProperty, value); }
        }

        /// <summary>
        /// Gets or sets the path data for the logo displayed in the title area of the window.
        /// </summary>
        public Geometry LogoData
        {
            get { return (Geometry)GetValue(LogoDataProperty); }
            set { SetValue(LogoDataProperty, value); }
        }
    }
}
