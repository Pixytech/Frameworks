using System;
using System.Diagnostics;
using System.Windows;
using Pixytech.Core.IoC;
using Pixytech.Desktop.Presentation.Infrastructure.Commands;
using Pixytech.Desktop.Presentation.Controls;

namespace Demo.Views
{
    /// <summary>
    /// Interaction logic for Shell.xaml
    /// </summary>
    public partial class Shell : ModernWindow
    {
        public Shell()
        {
            InitializeComponent();
            Loaded += Shell_Loaded;
        }

        void Shell_Loaded(object sender, RoutedEventArgs e)
        {
           
          //  webPage.Command = new DelegateCommand(OnLaunch);
        }

        private void OnLaunch()
        {
          //  var addressProvider = ObjectFactory.Builder.Build<IWebServerUrlProvider>();
            
           // WebLauncher.Launch(new Uri(addressProvider.HostBaseAddress));
            
        }
        
    }
}
