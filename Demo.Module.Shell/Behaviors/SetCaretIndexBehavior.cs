using Pixytech.Desktop.Presentation.Behaviors;
using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;


namespace Demo.Module.Shell.Behaviors
{
    public class SetCaretIndexBehavior : BehaviorBase<TextBox>
    {
        public static readonly DependencyProperty CaretPositionProperty;
        private bool _internalChange;

        static SetCaretIndexBehavior()
        {

            CaretPositionProperty = DependencyProperty.Register("CaretPosition", typeof(int), typeof(SetCaretIndexBehavior), new PropertyMetadata(0, OnCaretPositionChanged));
        }

        public int CaretPosition
        {
            get { return Convert.ToInt32(GetValue(CaretPositionProperty)); }
            set { SetValue(CaretPositionProperty, value); }
        }

        protected override void OnSetup()
        {
            AssociatedObject.ContextMenuOpening += AssociatedObject_ContextMenuOpening;
            AssociatedObject.KeyUp += OnKeyUp;
        }

        void AssociatedObject_ContextMenuOpening(object sender, ContextMenuEventArgs e)
        {
            UpdateCaret();
        }

        protected override void OnCleanup()
        {
            AssociatedObject.KeyUp -= OnKeyUp;
            AssociatedObject.ContextMenuClosing -= AssociatedObject_ContextMenuOpening;
        }


        private static void OnCaretPositionChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            var behavior = (SetCaretIndexBehavior)d;
            if (!behavior._internalChange)
            {
                behavior.AssociatedObject.CaretIndex = Convert.ToInt32(e.NewValue);
            }
        }

        private void OnKeyUp(object sender, KeyEventArgs e)
        {
            UpdateCaret();
        }

        private void UpdateCaret()
        {
            _internalChange = true;
            CaretPosition = AssociatedObject.CaretIndex;
            _internalChange = false;
        }
    }
}
