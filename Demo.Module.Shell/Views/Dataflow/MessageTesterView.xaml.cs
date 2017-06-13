using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using Xceed.Wpf.Toolkit.PropertyGrid;

namespace Graphnet.Dashboard.CoreUI.Views.Dataflow
{
    /// <summary>
    /// Interaction logic for MessageTesterView.xaml
    /// </summary>
    public partial class MessageTesterView : UserControl
    {
        public MessageTesterView()
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
