using System.Collections.Generic;
using System.Linq;
using Graphnet.Core.IoC;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure;

namespace Graphnet.Dashboard.CoreUI.ViewModels
{
    class ComponentBuilder : IComponentBuilder
    {
        public IEnumerable<IComponent> Build()
        {
            var comp = ObjectFactory.Builder.BuildAll<IComponent>();

            var components = comp.Where(component => component.AboutPages.Any() || component.Launchers.Any() || component.Matrix.Any()).ToList();

            return components.OrderBy(x => x.ComponentName).ToList();
        }
    }
}
