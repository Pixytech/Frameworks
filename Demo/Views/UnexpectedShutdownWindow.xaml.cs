using System;
using System.Runtime.InteropServices;
using Pixytech.Desktop.Presentation.Controls;
using System.Windows;

namespace Demo.Views
{
    /// <summary>
    /// Interaction logic for UnexpectedShutdownWindow.xaml
    /// </summary>
    public partial class UnexpectedShutdownWindow : ModernWindow
    {
        private Exception _exception;
        public UnexpectedShutdownWindow()
        {
            InitializeComponent();
            Header.Text = "Dashboard has encountered an unexpected error";
        }

        public Exception Exception
        {
            get { return _exception; }
            set
            {
                _exception = value;
                if (value != null)
                {
                    Message.Text = value.Message;
                    Details.Text = value.StackTrace;
                }
            }
        }

        
        private void Button_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            Close();
        }

    }
}
