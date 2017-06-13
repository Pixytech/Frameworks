using Graphnet.Dashboard.Wpf.Presentation.Infrastructure;
using Microsoft.Practices.Prism.Regions;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Security
{
    public class SecurityVm :BasePage, INavigationAware
    {
        public SecurityVm()
        {
            Title = "Security";
        }

        public bool IsNavigationTarget(NavigationContext navigationContext)
        {
            return true;
        }

        public void OnNavigatedFrom(NavigationContext navigationContext)
        {
        }

        public void OnNavigatedTo(NavigationContext navigationContext)
        {
        }
    }
}
