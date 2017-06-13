using System.Collections.ObjectModel;
using Graphnet.Dashboard.CoreUI.Models;
using Graphnet.Dashboard.Wpf.Presentation.Infrastructure.Dataflow;

namespace Graphnet.Dashboard.CoreUI.ViewModels.Dataflow
{
    class SegmentVariableProvider : IVariableProvider
    {
        private readonly SegmentModel _segment;
        
        public SegmentVariableProvider(SegmentModel segment)
        {
            _segment = segment;
        }

        public ObservableCollection<VariableModel> Variables
        {
            get { return _segment.Variables; }
        }
    }
}
