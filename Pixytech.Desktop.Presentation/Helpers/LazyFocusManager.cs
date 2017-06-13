using System;
using System.Windows;
using System.Windows.Input;
using System.Windows.Threading;

namespace Pixytech.Desktop.Presentation.Helpers
{
    public static class LazyFocusManager
    {
        public static readonly DependencyProperty FocusedElementProperty = DependencyProperty.RegisterAttached("FocusedElement", typeof(IInputElement), typeof(LazyFocusManager), new PropertyMetadata(new PropertyChangedCallback(OnFocusedElementChanged)));

        private static void OnFocusedElementChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            d.Dispatcher.BeginInvoke(DispatcherPriority.Input,
                new Action(() => FocusManager.SetFocusedElement(d, (IInputElement)e.NewValue)));

        }

        /// <summary>Sets logical focus on the specified element.</summary>
        /// <param name="element">The focus scope in which to make the specified element the <see cref="P:System.Windows.Input.FocusManager.FocusedElement" />.</param>
        /// <param name="value">The element to give logical focus to.</param>
        public static void SetFocusedElement(DependencyObject element, IInputElement value)
        {
            if (element == null)
            {
                throw new ArgumentNullException("element");
            }

            FocusManager.SetFocusedElement(element, value);
            element.SetValue(FocusedElementProperty, value);
        }

        public static IInputElement GetFocusedElement(DependencyObject element)
        {
            return FocusManager.GetFocusedElement(element);
        }
    }
}
