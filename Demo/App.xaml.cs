
using System.Windows;
using Demo.Presentation.Infrastructure;
using Pixytech.Desktop.Presentation.Infrastructure;

namespace Demo
{
    /// <summary>
    /// Interaction logic for App.xaml
    /// </summary>
    public partial class App : Application
    {
        private readonly Bootstrapper _bootstarpper;
        private readonly ISplash _splashViewModel;
        private readonly IAppDeployment _appDeployment;
        
        public App(ISplash splashViewModel, IAppDeployment appDeployment, Bootstrapper bootstrapper)
        {
            _appDeployment = appDeployment;
            _splashViewModel = splashViewModel;
            _bootstarpper = bootstrapper;
        }

      
        
        public void ProcessCommand(string[] args)
        {
          //  ((MainWindow)App.Current.MainWindow).Text = "Process :" + string.Join("\r", args);
        }

        public void ActivateApp()
        {
            if (Current != null && Current.MainWindow != null)
            {
                Current.MainWindow.WindowState = WindowState.Maximized;
                Current.MainWindow.Activate();
            }
        }

        public bool RestartRequired()
        {
            var restart = _appDeployment.CurrentVersion !=
                   _appDeployment.UpdatedVersion;
            if (restart)
            {
                if (
                    MessageBox.Show(Current.MainWindow, "Please restart your dashboard client application.", "Restart Dashboard",
                        MessageBoxButton.YesNo, MessageBoxImage.Information, MessageBoxResult.Yes) ==
                    MessageBoxResult.Yes)
                {
                    return true;
                }
            }
            return false;
        }

        public void Start(string[] args)
        {
            _splashViewModel.Message = "Starting dashboard ...";

            _bootstarpper.UseLocalModules = UseLocalModules;

            _bootstarpper.Run();
        }

        public bool UseLocalModules { get; set; }
    }
}
