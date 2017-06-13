using System.Windows;
using Pixytech.Desktop.Presentation.Infrastructure;

namespace Pixytech.Desktop.Presentation.Helpers
{
    public static class WindowHelper
    {
        public static Window GetParent(ViewModelBase viewModelBase)
        {
            Window parent;
            if (!TryFindWindowForViewModel(viewModelBase, out parent))
            {
                parent = Application.Current.MainWindow;
            }

            return parent;
        }

        public static bool TryFindWindowForViewModel(ViewModelBase viewModel, out Window window)
        {
            window = null;

            if (viewModel != null)
            {
                foreach (Window appWindow in Application.Current.Windows)
                {
                    if (ReferenceEquals(viewModel, appWindow.DataContext))
                    {
                        window = appWindow;
                        return true;
                    }
                }

                return false;
            }

            return false;
        }
    }
}
