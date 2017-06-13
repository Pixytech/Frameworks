using System.Windows;
using System.Windows.Media;
using Pixytech.Desktop.Presentation.AvalonDock.Layout;
using Pixytech.Desktop.Presentation.Behaviors;
using Pixytech.Desktop.Presentation.AvalonDock.Controls;
using Pixytech.Desktop.Presentation.Utilities;

namespace Graphnet.Dashboard.CoreUI.Behaviors
{
    public class LayoutAnchorableBehavior : BehaviorBase<FrameworkElement>
    {
        public static readonly DependencyProperty IsVisibleProperty = DependencyProperty.Register("IsVisible", typeof(bool), typeof(LayoutAnchorableBehavior), new PropertyMetadata(false, OnVisibilityChanged));
        private LayoutAnchorable _layoutAnchorableItem;
        
        public bool IsVisible
        {
            get { return (bool)GetValue(IsVisibleProperty); }
            set { SetValue(IsVisibleProperty, value); }
        }

        protected override void OnSetup()
        {
            AssociatedObject.Loaded += AssociatedObject_Loaded;
        }

        protected override void OnCleanup()
        {
            AssociatedObject.Loaded -= AssociatedObject_Loaded;
            if (_layoutAnchorableItem != null)
            {
                _layoutAnchorableItem.Hiding -= _layoutAnchorableItem_IsVisibleChanged;
            }
        }

        void AssociatedObject_Loaded(object sender, RoutedEventArgs e)
        {
             var control = FindLayoutAnchorable();
            if (control != null)
            {
                _layoutAnchorableItem = control;
                _layoutAnchorableItem.IsVisibleChanged += _layoutAnchorableItem_IsVisibleChanged;
                UpdateVisibility(IsVisible);
            }
        }

        void _layoutAnchorableItem_IsVisibleChanged(object sender, System.EventArgs e)
        {
            IsVisible = _layoutAnchorableItem.IsVisible;
        }

        
        private static void OnVisibilityChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            var behavior = (LayoutAnchorableBehavior)d;
            behavior.UpdateVisibility((bool) e.NewValue);

        }

        private void UpdateVisibility(bool isVisible)
        {
            if (_layoutAnchorableItem != null)
            {
                if (isVisible)
                {
                    _layoutAnchorableItem.Show();
                }
                else
                {
                    _layoutAnchorableItem.Hide();
                }
            }
        }


        private LayoutAnchorable FindLayoutAnchorable()
        {
            var anchorableControl = VisualTreeHelperEx.FindAncestorByType<LayoutAnchorableControl>(AssociatedObject);
            if (anchorableControl != null)
            {
                return anchorableControl.DataContext as LayoutAnchorable;
            }

            return null;
        }
    }
}
