using System.Linq;
using System.Windows;
using Pixytech.Desktop.Presentation.Interactivity;

namespace Pixytech.Desktop.Presentation.Behaviors
{
    public static class ControlProperties
    {
        public static readonly DependencyProperty AutoRefreshStyleProperty =
            DependencyProperty.RegisterAttached("AutoRefreshStyle", typeof(bool), typeof(ControlProperties),
                new PropertyMetadata(false, OnAutoRefreshStyleChanged));

        public static bool GetAutoRefreshStyle(DependencyObject control)
        {
            return (bool)control.GetValue(AutoRefreshStyleProperty);
        }

        public static void SetAutoRefreshStyle(
            DependencyObject control, bool value)
        {
            control.SetValue(AutoRefreshStyleProperty, value);
        }

        private static void OnAutoRefreshStyleChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            var behaviors = Interaction.GetBehaviors(d);
            var newValue = (bool)e.NewValue;
            if (newValue)
            {
                if (!behaviors.OfType<StyleRefreshBehavior>().Any())
                {
                    behaviors.Add(new StyleRefreshBehavior());
                }
            }
            else
            {
                foreach (var item in behaviors.ToArray())
                {
                    if (item is StyleRefreshBehavior)
                        behaviors.Remove(item);
                }
            }
        }

        private class StyleRefreshBehavior : BehaviorBase<FrameworkElement>
        {
            protected override void OnSetup()
            {
                var style = AssociatedObject.GetValue(FrameworkElement.StyleProperty);
                var item = AssociatedObject;
                item.SetValue(FrameworkElement.StyleProperty, null);
                item.SetValue(FrameworkElement.StyleProperty, style);
                base.OnSetup();
            }
        }
    }
}
