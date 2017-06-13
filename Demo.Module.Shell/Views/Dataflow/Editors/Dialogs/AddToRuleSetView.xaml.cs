using System.Windows.Controls;
using Xceed.Wpf.Toolkit.PropertyGrid;

namespace Graphnet.Dashboard.CoreUI.Views.Dataflow.Editors.Dialogs
{
    /// <summary>
    /// Interaction logic for RuleMiddlewareEditor.xaml
    /// </summary>
    public partial class AddToRuleSetView : UserControl
    {
        public AddToRuleSetView()
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
