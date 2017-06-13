using System.Windows;
using System.Windows.Data;
using System.Windows.Input;

namespace Pixytech.Desktop.Presentation.Bindings
{
    /// <summary>
    /// Adapter for binding RoutedCommands to Commands in view models
    /// XAML Usage : 
    /// <CommandBindings>
    /// <ex:CommandBindingAdapter Command="Save" Binding="{Binding SaveCommand}"/>
    /// </CommandBindings>
    /// where Save is a routed command and SaveCommand is ICommand in view model
    /// </summary>
    public class CommandBindingAdapter : CommandBinding
    {
        private static readonly DependencyProperty ValueProperty = DependencyProperty.RegisterAttached("CommandValue", typeof(ICommand), typeof(CommandBindingAdapter), new UIPropertyMetadata(null));

        private Binding _binding;

        public Binding Binding
        {
            get { return _binding; }
            set
            {
                _binding = value;

                CanExecute -= OnCommand_CanExecute;
                CanExecute += OnCommand_CanExecute;

                Executed -= OnCommand_Executed;
                Executed += OnCommand_Executed;
            }
        }

        private void OnCommand_Executed(object sender, ExecutedRoutedEventArgs e)
        {
            var command = GetCommand(sender);

            if (command != null)
            {
                command.Execute(e.Parameter);
                e.Handled = true;
            }
        }

        private void OnCommand_CanExecute(object sender, CanExecuteRoutedEventArgs e)
        {
            var command = GetCommand(sender);
            if (command != null)
            {
                e.CanExecute = command.CanExecute(e.Parameter);
                e.Handled = true;
            }
        }

        private ICommand GetCommand(object sender)
        {
            var senderDpObj = sender as DependencyObject;
            if (senderDpObj == null) return null;
            BindingOperations.SetBinding(senderDpObj, ValueProperty, _binding);
            var command = senderDpObj.GetValue(ValueProperty);
            BindingOperations.ClearBinding(senderDpObj, ValueProperty);
            return command as ICommand;
        }
    }
}
