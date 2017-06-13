using System.Collections.Generic;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure;

namespace Graphnet.Dashboard.CoreUI.ViewModels
{
    internal interface IComponentBuilder
    {
        IEnumerable<IComponent> Build();
    }
}
