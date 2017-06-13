using System;
using System.Windows;
using System.Windows.Controls.Primitives;

namespace Pixytech.Desktop.Presentation.Behaviors
{
    /// <summary>
    /// Defines the reposition behavior of a <see cref="Popup"/> control when the window to which it is attached is moved or resized.
    /// </summary>
    public class RepositionPopupBehavior: BehaviorBase<Popup>
    {
        protected override void OnSetup()
        {
            base.OnSetup();
            var window = Window.GetWindow(AssociatedObject.PlacementTarget);
            if (window == null) { return; }

            window.LocationChanged += OnLocationChanged;
            window.SizeChanged += OnSizeChanged;
        }


        protected override void OnCleanup()
        {
            base.OnCleanup();
            var window = Window.GetWindow(AssociatedObject.PlacementTarget);
            if (window == null) { return; }
            window.LocationChanged -= OnLocationChanged;
            window.SizeChanged -= OnSizeChanged;
        }

        private void OnLocationChanged(object sender, EventArgs e)
        {
            var offset = AssociatedObject.HorizontalOffset;
            AssociatedObject.HorizontalOffset = offset + 1;
            AssociatedObject.HorizontalOffset = offset;
        }


        private void OnSizeChanged(object sender, SizeChangedEventArgs e)
        {
            var offset = AssociatedObject.HorizontalOffset;
            AssociatedObject.HorizontalOffset = offset + 1;
            AssociatedObject.HorizontalOffset = offset;
        }
    }

}
