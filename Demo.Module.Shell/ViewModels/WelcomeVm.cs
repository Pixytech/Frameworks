using System.Collections.Generic;
using System.Diagnostics;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Matrix;

namespace Graphnet.Dashboard.CoreUI.ViewModels
{
    class WelcomeVm: BasePage
    {
        public WelcomeVm(IComponentBuilder componentBuilder, AboutVm aboutPageLocal)
        {
            Title = "Welcome";
            var components = componentBuilder.Build();

            var pages = new List<IAboutPage> {aboutPageLocal};

            foreach (var component in components)
            {
                pages.AddRange(component.AboutPages);
            }

            AboutPages = pages;
            aboutPageLocal.IsSelected = true;
        }

        public IEnumerable<IAboutPage> AboutPages
         {
             get { return GetProperty<IEnumerable<IAboutPage>>(); }
             private set { SetProperty(value); }
         }
    }
}
