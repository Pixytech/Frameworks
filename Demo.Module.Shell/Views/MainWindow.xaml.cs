using System.Windows;
using Microsoft.Practices.Prism.Regions;
using Pixytech.Core.IoC;

namespace Demo.Module.Shell.Views
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow
    {
        public MainWindow()
        {
            InitializeComponent();
            Loaded += MainWindow_Loaded;
          
        }

        void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            Loaded -= MainWindow_Loaded;
            var parent = Window.GetWindow(this);
            if (parent != null)
            {
                parent.DataContext = DataContext;
            }

            RegionManager.SetRegionManager(this, ObjectFactory.Builder.Build<IRegionManager>());
        }

        private void OpenContextMenu(object sender, RoutedEventArgs e)
        {
            var target = sender as FrameworkElement;
            if (target != null && target.ContextMenu != null)
            {
                //target.ContextMenu.IsEnabled = true;
                //target.ContextMenu.PlacementTarget = target;
                target.ContextMenu.DataContext = target.DataContext;
                target.ContextMenu.IsOpen = true;
            }
        }

        private void ToggleMatrixLayoutAnchorable(object sender, RoutedEventArgs e)
        {
            //if (MatrixLayoutAnchorable.IsHidden)
            //{
            //    MatrixLayoutAnchorable.Show();
            //}
            //else
            //{
            //    MatrixLayoutAnchorable.Hide();
            //}
        }

        private void ToggleQuickLaunchLayoutAnchorable(object sender, RoutedEventArgs e)
        {
            //if (QuickLaunchLayoutAnchorable.IsHidden)
            //{
            //    QuickLaunchLayoutAnchorable.Show();
            //}
            //else
            //{
            //    QuickLaunchLayoutAnchorable.Hide();
            //}
        }

        private void ToggleStatusBar(object sender, RoutedEventArgs e)
        {
            // StatusBar.Visibility = StatusBar.Visibility == Visibility.Collapsed ? Visibility.Visible : Visibility.Collapsed;
        }
    }
}
