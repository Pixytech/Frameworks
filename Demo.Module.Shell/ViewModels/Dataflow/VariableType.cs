using System;
using Graphnet.Wpf.Presentation.Infrastructure;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Dataflow
{
    class VariableType : ViewModelBase
    {
        public string Name { get; set; }
        public Type Type { get; set; }
    }
}
