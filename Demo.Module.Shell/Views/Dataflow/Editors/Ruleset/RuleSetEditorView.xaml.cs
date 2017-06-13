using System.Windows.Controls;
using Xceed.Wpf.Toolkit.PropertyGrid;

namespace Graphnet.Dashboard.CoreUI.Views.Dataflow.Editors.Ruleset
{
    /// <summary>
    /// Interaction logic for RuleMiddlewareEditor.xaml
    /// </summary>
    public partial class RuleSetEditorView : UserControl
    {
        public RuleSetEditorView()
        {
            InitializeComponent();
        }

        private void PropertyGrid_OnPreparePropertyItem(object sender, PropertyItemEventArgs e)
        {
            if (e.PropertyItem.IsExpandable)
                e.PropertyItem.IsExpanded = true;
        }
    }
}
