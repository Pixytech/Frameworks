using System.Collections.Generic;
using System.Linq;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure;
using Graphnet.Wpf.Presentation.Infrastructure;

namespace Graphnet.Dashboard.CoreUI.ViewModels
{
    internal class LauncherVm : ViewModelBase
    {
         public LauncherVm(IComponentBuilder componentBuilder)
         {
             var components = componentBuilder.Build().Where(component => component.Launchers.Any()).ToList();

             Components = components;
         }

         public IEnumerable<IComponent> Components
         {
             get { return GetProperty<IEnumerable<IComponent>>(); }
             private set { SetProperty(value); }
         }

    }
}
