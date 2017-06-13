using System.Windows;

namespace Pixytech.Desktop.Presentation.Behaviors
{
    public class HostWindowBehavior : BehaviorBase<FrameworkElement>
    {
        private static readonly DependencyProperty WindowStyleProperty = DependencyProperty.Register("WindowStyle", typeof(Style), typeof(HostWindowBehavior), new PropertyMetadata(null, OnWindowStyleChanged));

        private static void OnWindowStyleChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            var window = Window.GetWindow(d);
            ((HostWindowBehavior)d).ApplyStyle(window);
        }

        public Style WindowStyle
        {
            get
            {
                return (Style)GetValue(WindowStyleProperty);
            }
            set
            {
                SetValue(WindowStyleProperty, value);
            }
        }

        protected override void OnSetup()
        {
            ApplyStyle(Window.GetWindow(AssociatedObject));
        }

        private void ApplyStyle(DependencyObject window)
        {
            if (window != null)
            {
                window.SetValue(FrameworkElement.StyleProperty, WindowStyle);
                //window.Dispatcher.BeginInvoke(DispatcherPriority.DataBind, new Action(() =>  BindingOperations.SetBinding(window, FrameworkElement.StyleProperty,
                //  new Binding("WindowStyle") {Source = this})));

                //window.Dispatcher.BeginInvoke(DispatcherPriority.DataBind, new Action(() => window.SetValue(FrameworkElement.StyleProperty, WindowStyle)));


            }
        }

    }
}
